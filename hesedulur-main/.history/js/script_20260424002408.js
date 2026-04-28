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