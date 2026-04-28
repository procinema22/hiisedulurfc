/* script.js v3.0 - final
Patch: laprak otomatis adjustable + rectangle offset/scale support
Perbaikan: toggle watermark (Alt+W), perbaikan PDF watermark, scope bugs, duplicate handlers removed, safety checks
*/

/* ---------------------------
Element refs
--------------------------- */

const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('sizeSelect');
const customSize = document.getElementById('customSize');
const customW = document.getElementById('customW');
const customH = document.getElementById('customH');
const marginInputMm = document.getElementById('marginInputMm');
const gapInput = document.getElementById('gap');
const priceDisplay = document.getElementById('priceDisplay');
const userName = document.getElementById('userName');
const previewBtn = document.getElementById('previewBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadPdf = document.getElementById('downloadPdf');
const resetBtn = document.getElementById('reset');
const batchList = document.getElementById('batchList');
const modeSelect = document.getElementById('modeSelect');
const hargaPerFotoBox = document.getElementById('hargaPerFotoBox');
const hargaPerFotoInput = document.getElementById('hargaPerFoto');
if (hargaPerFotoInput && !hargaPerFotoInput.value) hargaPerFotoInput.value = '1000';
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');
const pageNav = document.getElementById('pageNav');
const darkSwitch = document.getElementById('darkSwitch');
const circleControls = document.getElementById('circleControls');
const circleDiameter = document.getElementById('circleDiameter');
const laprakMode = document.getElementById('laprakMode');
const laprakControls = document.getElementById('laprakControls');
const laprakPrice = document.getElementById('laprakPrice');
const manualHargaCheckbox = document.getElementById('manualHargaCheckbox');
const manualHargaBox = document.getElementById('manualHargaBox');
const manualHargaInput = document.getElementById('manualHargaInput');
const hideInfo = document.getElementById('hideInfo');
const pilihanHargaBox = document.getElementById('pilihanHarga');
const canvasDropOverlay = document.getElementById('canvasDropOverlay');
const canvasDropHint = document.getElementById('canvasDropHint');

/* ---------------------------
Constants & state
--------------------------- */
const PREVIEW_SCALE = 0.25;
const PX_PER_CM = 118;
const STORAGE_KEY = 'cetakfoto_v3_placements';

let batches = [];
let placementsByPage = [];
let pagesCache = [];
let currentPageIndex = 0;
let selectedPlacement = null;
let isDragging = false, dragStart = null;
let watermarkEnabled = false;

/* ---------------------------
Watermark image
--------------------------- */
const watermarkImg = new Image();
watermarkImg.src = "SDLR.png";
watermarkImg.onload = () => {
  console.log("✔ Watermark Loaded:", watermarkImg.width + "x" + watermarkImg.height);
  if (typeof autoPreview === "function") autoPreview();
};
watermarkImg.onerror = () => {
  console.warn("❌ Watermark image tidak ditemukan: SDLR.png");
};

/* ---------------------------
Load image (simplified)
--------------------------- */
function loadImageWithEXIF(file){
  return new Promise(res=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>res(img);
      img.onerror = ()=>res(null);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}/* ---------------------------
    Pricing helpers
--------------------------- */
function priceFromUsedHeightsArray(usedHeightPxArray) {
  const pxToMm = 297 / 3508;
  const halfPageMm = 297 / 2;
  let total = 0;

  usedHeightPxArray.forEach(px => {
    if (!px || px <= 0) return;
    const usedMm = px * pxToMm;
    total += (usedMm <= halfPageMm) ? 1000 : 2000;
  });

  return total;
}

function countPerfotoFromBatches(batchesArr) {
  let cnt = 0;
  for (const b of batchesArr) {
    const cp = Math.max(1, b.copy || 1);
    const fileCount = (b.files && b.files.length)
      ? b.files.length * cp
      : 0;

    if (b.mode === 'perfoto') cnt += fileCount;
  }
  return cnt;
}

/* ---------------------------
    Unified price compute
--------------------------- */
async function computeTotalPriceForPreviewOrGenerate() {
  const { pages, usedHeightPerPagePx } = await renderAllPagesToCanvases();

  const laprakPriceTotal = laprakMode && laprakMode.checked
    ? priceFromUsedHeightsArray(usedHeightPerPagePx)
    : 0;

  let normalPagePrice = 0;
  if (!laprakMode || !laprakMode.checked) {
    normalPagePrice = priceFromUsedHeightsArray(usedHeightPerPagePx);
  }

  const perFotoCount = countPerfotoFromBatches(batches);
  const hargaPerFoto = parseInt(hargaPerFotoInput?.value || '1000') || 1000;
  const perfotoTotal = perFotoCount * hargaPerFoto;

  if (manualHargaCheckbox?.checked) {
    return parseInt(manualHargaInput.value) || 0;
  }

  const grandTotal = laprakPriceTotal + normalPagePrice + perfotoTotal;

  return {
    grandTotal,
    laprakPriceTotal,
    normalPagePrice,
    perfotoTotal,
    pagesCount: pages.length,
    pages,
    usedHeightPerPagePx
  };
}

/* ---------------------------
    Update price preview
--------------------------- */
async function updatePricePreview() {
  if (!batches.length) {
    priceDisplay.textContent = 'Harga: Rp 0';
    return;
  }

  if (manualHargaCheckbox?.checked) {
    const val = parseInt(manualHargaInput.value) || 0;
    priceDisplay.textContent = `Harga: Rp ${val.toLocaleString()} (manual)`;
    return;
  }

  try {
    await buildPlacementsForPages();
    const result = await computeTotalPriceForPreviewOrGenerate();
    priceDisplay.textContent =
      `Harga: Rp ${result.grandTotal.toLocaleString()} (preview)`;
  } catch (err) {
    console.error(err);
    priceDisplay.textContent = 'Harga error';
  }
}

/* ---------------------------
    Auto preview
--------------------------- */
async function autoPreview() {
  await buildPlacementsForPages();
  const result = await renderAllPagesToCanvases();

  pagesCache = result.pages || [];
  showPageAtIndex(0);

  await updatePricePreview();
}

/* ---------------------------
    Preview button
--------------------------- */
previewBtn?.addEventListener('click', async () => {
  showLoading();

  try {
    await autoPreview();
  } catch (err) {
    console.error(err);
    toast("Gagal preview");
  }

  hideLoading();
});

/* ---------------------------
    Show page
--------------------------- */
function showPageAtIndex(i) {
  if (!pagesCache.length) return;

  currentPageIndex = Math.max(0, Math.min(i, pagesCache.length - 1));
  const p = pagesCache[currentPageIndex];

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(p, 0, 0, canvas.width, canvas.height);

  pageNav.style.display = pagesCache.length > 1 ? 'flex' : 'none';
  pageIndicator.textContent =
    `Halaman ${currentPageIndex + 1} / ${pagesCache.length}`;

  prevPageBtn.disabled = currentPageIndex === 0;
  nextPageBtn.disabled = currentPageIndex === pagesCache.length - 1;
}

prevPageBtn?.addEventListener('click', () => {
  showPageAtIndex(currentPageIndex - 1);
});

nextPageBtn?.addEventListener('click', () => {
  showPageAtIndex(currentPageIndex + 1);
});

/* ---------------------------
    Drag & Zoom
--------------------------- */
canvas.addEventListener('wheel', (e) => {
  if (!selectedPlacement) return;

  e.preventDefault();

  const delta = e.deltaY < 0 ? 0.05 : -0.05;
  selectedPlacement.scale =
    Math.max(0.2, (selectedPlacement.scale || 1) + delta);

  pagesCache[currentPageIndex] =
    renderPreviewFromPlacements(currentPageIndex);

  showPageAtIndex(currentPageIndex);
  saveAllPlacementData();
}, { passive: false });

/* ---------------------------
    Reset
--------------------------- */
resetBtn?.addEventListener('click', async () => {
  batches = [];
  placementsByPage = [];
  pagesCache = [];

  localStorage.removeItem(STORAGE_KEY);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  batchList.innerHTML = '';
  priceDisplay.textContent = 'Harga: Rp 0';

  await updatePricePreview();
});

/* ---------------------------
    Generate
--------------------------- */
generateBtn?.addEventListener('click', async () => {
  showLoading();

  try {
    await buildPlacementsForPages();
    const result = await computeTotalPriceForPreviewOrGenerate();

    pagesCache = result.pages;
    showPageAtIndex(0);

    priceDisplay.textContent =
      `Harga: Rp ${result.grandTotal.toLocaleString()}`;

  } catch (err) {
    console.error(err);
    alert("Error generate");
  }

  hideLoading();
});

/* ---------------------------
    Toast
--------------------------- */
function toast(msg){
  const t = document.getElementById("toast");
  t.innerText = msg;
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2500);
}

/* ---------------------------
    Loading
--------------------------- */
function showLoading() {
  document.getElementById("loadingOverlay_kolase")
    .classList.add("active");
}

function hideLoading() {
  document.getElementById("loadingOverlay_kolase")
    .classList.remove("active");
}

/* ---------------------------
    Init canvas
--------------------------- */
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
/* ---------------------------
    Download / Open PDF
--------------------------- */
if (downloadPdf) downloadPdf.onclick = async () => {

  if (!batches.length) {
    return alert('Belum ada foto.');
  }

  if (!hideInfo.checked && !userName.value.trim()) {
    return alert('Isi nama dulu sebelum buat PDF!');
  }

  downloadPdf.disabled = true;
  const prevText = downloadPdf.textContent;
  downloadPdf.textContent = '⏳ Membuat PDF...';

  try {
    const result = await renderAllPagesToCanvases();
    const pages = result.pages;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'pt', 'a4');

    let totalHarga = parseInt(
      priceDisplay.textContent.replace(/[^\d]/g, '')
    ) || 0;

    pages.forEach((page, i) => {

      if (i > 0) pdf.addPage();

      pdf.addImage(
        page.toDataURL('image/jpeg', 0.92),
        'JPEG',
        0,
        0,
        595,
        842
      );

      /* WATERMARK */
      if (watermarkEnabled && watermarkImg.complete) {
        const wmW = 595 * 0.4;
        const wmH = wmW * (watermarkImg.height / watermarkImg.width);
        const wmX = (595 - wmW) / 2;
        const wmY = (842 - wmH) / 2;

        pdf.addImage(watermarkImg, "PNG", wmX, wmY, wmW, wmH);
      }

      /* FOOTER */
      if (i === pages.length - 1 && !hideInfo.checked) {
        pdf.setFontSize(12);
        pdf.text(`Nama: ${userName.value}`, 20, 820);
        pdf.text(`Harga: Rp ${totalHarga.toLocaleString()}`, 20, 835);
      }
    });

    const blob = pdf.output('blob');
    window.open(URL.createObjectURL(blob), '_blank');

  } catch (err) {
    console.error(err);
    alert("Gagal buat PDF");
  }

  downloadPdf.disabled = false;
  downloadPdf.textContent = prevText;
};

/* ---------------------------
    Canvas drag drop (langsung ke canvas)
--------------------------- */
canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
  canvas.classList.add("hover-canvas");
});

canvas.addEventListener("dragleave", () => {
  canvas.classList.remove("hover-canvas");
});

canvas.addEventListener("drop", async (e) => {
  e.preventDefault();
  canvas.classList.remove("hover-canvas");

  const files = Array.from(e.dataTransfer.files || []);
  if (!files.length) return;

  await addFilesToBatch(files);
  await autoPreview();
  await updatePricePreview();
});

/* ---------------------------
    Keyboard Shortcut
--------------------------- */
document.addEventListener("keydown", (e) => {

  // ALT + W → toggle watermark
  if (e.altKey && e.key.toLowerCase() === "w") {
    watermarkEnabled = !watermarkEnabled;

    console.log("Watermark:", watermarkEnabled ? "ON" : "OFF");

    autoPreview();
  }

});

/* ---------------------------
    Mode & UI Control
--------------------------- */
modeSelect?.addEventListener("change", async () => {

  if (circleControls) {
    circleControls.style.display =
      modeSelect.value === "circle" ? "block" : "none";
  }

  await autoPreview();
});

sizeSelect?.addEventListener("change", async () => {

  if (customSize) {
    customSize.style.display =
      sizeSelect.value === "custom" ? "flex" : "none";
  }

  await autoPreview();
});

laprakMode?.addEventListener("change", () => {

  if (laprakControls) {
    laprakControls.style.display =
      laprakMode.checked ? "block" : "none";
  }

  updatePricePreview();
});

/* ---------------------------
    Manual harga (auto bulat 500)
--------------------------- */
manualHargaInput?.addEventListener("input", () => {

  let val = parseInt(manualHargaInput.value) || 0;

  val = Math.round(val / 500) * 500;
  if (val < 500) val = 500;

  manualHargaInput.value = val;

  priceDisplay.textContent =
    `Harga: Rp ${val.toLocaleString()} (manual)`;

});

/* ---------------------------
    Save sebelum keluar
--------------------------- */
window.addEventListener("beforeunload", () => {
  saveAllPlacementData();
});

/* ---------------------------
    INIT (biar gak kosong)
--------------------------- */
(function init() {

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (manualHargaCheckbox) {
    manualHargaCheckbox.checked = true;
  }

  if (manualHargaInput && !manualHargaInput.value) {
    manualHargaInput.value = 1000;
  }

  updatePricePreview();

})();
/* ===========================
   SAFETY INIT ELEMENT
=========================== */

// Hindari error kalau elemen tidak ada
function safeEl(id){
  return document.getElementById(id) || null;
}

// fallback element (biar tidak undefined)
const safeElements = [
  "hargaPerFoto",
  "hargaPerFotoBox",
  "pilihanHarga",
  "darkSwitch"
];

safeElements.forEach(id=>{
  if(!document.getElementById(id)){
    window[id] = null;
  }
});


/* ===========================
   GLOBAL ERROR HANDLER
=========================== */

window.addEventListener("error", (e)=>{
  console.warn("JS Error ditangkap:", e.message);
});

window.addEventListener("unhandledrejection", (e)=>{
  console.warn("Promise Error:", e.reason);
});


/* ===========================
   AUTO FIX NILAI INPUT
=========================== */

function sanitizeNumberInput(input, min = 0){
  if(!input) return;

  let val = parseInt(input.value) || 0;
  if(val < min) val = min;

  input.value = val;
}

marginInputMm?.addEventListener("blur", ()=>{
  sanitizeNumberInput(marginInputMm, 1);
});

gapInput?.addEventListener("blur", ()=>{
  sanitizeNumberInput(gapInput, 0);
});

circleDiameter?.addEventListener("blur", ()=>{
  sanitizeNumberInput(circleDiameter, 1);
});


/* ===========================
   PERFORMANCE BOOST (CACHE)
=========================== */

// cache image supaya tidak reload berkali-kali
const imageCache = new Map();

async function loadCachedImage(file, mode="preview"){
  const key = fileKeyFor(file) + "_" + mode;

  if(imageCache.has(key)){
    return imageCache.get(key);
  }

  const img = await loadImageWithEXIF(file, mode);
  if(img) imageCache.set(key, img);

  return img;
}

// override loader lama (tanpa ubah struktur utama)
const originalLoader = loadImageWithEXIF;
loadImageWithEXIF = loadCachedImage;


/* ===========================
   AUTO CLEAN CACHE
=========================== */

function clearImageCache(){
  imageCache.clear();
}

resetBtn?.addEventListener("click", clearImageCache);


/* ===========================
   PREVENT DOUBLE CLICK BUG
=========================== */

function preventSpamClick(btn, delay = 1000){
  if(!btn) return;

  let locked = false;

  btn.addEventListener("click", ()=>{
    if(locked){
      event.stopImmediatePropagation();
      return;
    }

    locked = true;
    setTimeout(()=> locked = false, delay);
  }, true);
}

preventSpamClick(generateBtn);
preventSpamClick(downloadPdf);


/* ===========================
   AUTO SCROLL KE CANVAS
=========================== */

function scrollToCanvas(){
  canvas?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

generateBtn?.addEventListener("click", scrollToCanvas);


/* ===========================
   AUTO PREVIEW DELAY (ANTI LAG)
=========================== */

let previewTimeout = null;

function smartPreview(){
  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(()=>{
    autoPreview();
  }, 300);
}

// ganti event berat jadi debounce
marginInputMm?.addEventListener("input", smartPreview);
gapInput?.addEventListener("input", smartPreview);
customW?.addEventListener("input", smartPreview);
customH?.addEventListener("input", smartPreview);


/* ===========================
   DEBUG MODE (opsional)
=========================== */

const DEBUG = false;

function debugLog(...args){
  if(DEBUG) console.log("[DEBUG]", ...args);
}

debugLog("Script loaded v3 FINAL");


/* ===========================
   FINAL INIT GUARD
=========================== */

(function finalInitCheck(){

  if(!canvas || !ctx){
    console.error("Canvas tidak ditemukan!");
    return;
  }

  if(!upload){
    console.warn("Upload tidak tersedia");
  }

  // auto preview kalau ada data lama
  if(batches.length){
    autoPreview();
  }

})();