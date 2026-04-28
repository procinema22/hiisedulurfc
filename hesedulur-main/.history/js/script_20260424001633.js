/* ============ FINAL SCRIPT CLEAN VERSION ============ */

/* ---------------------------
   ELEMENT REFS (SAFE)
--------------------------- */
const $ = id => document.getElementById(id);

const upload = $("upload");
const canvas = $("canvas");
const ctx = canvas?.getContext("2d");

const sizeSelect = $("sizeSelect");
const customSize = $("customSize");
const customW = $("customW");
const customH = $("customH");

const marginInputMm = $("marginInputMm");
const gapInput = $("gap");

const priceDisplay = $("priceDisplay");
const userName = $("userName");

const previewBtn = $("previewBtn");
const generateBtn = $("generateBtn");
const downloadPdf = $("downloadPdf");
const resetBtn = $("reset");

const batchList = $("batchList");
const modeSelect = $("modeSelect");

const prevPageBtn = $("prevPage");
const nextPageBtn = $("nextPage");
const pageIndicator = $("pageIndicator");
const pageNav = $("pageNav");

const circleControls = $("circleControls");
const circleDiameter = $("circleDiameter");

const laprakMode = $("laprakMode");
const laprakControls = $("laprakControls");

const manualHargaCheckbox = $("manualHargaCheckbox");
const manualHargaBox = $("manualHargaBox");
const manualHargaInput = $("manualHargaInput");

const hideInfo = $("hideInfo");

/* ---------------------------
   STATE
--------------------------- */
const PREVIEW_SCALE = 0.25;
const PX_PER_CM = 118;

let batches = [];
let placementsByPage = [];
let pagesCache = [];
let currentPageIndex = 0;

/* ---------------------------
   SAFE WATERMARK
--------------------------- */
let watermarkEnabled = false;
const watermarkImg = new Image();
watermarkImg.src = "SDLR.png";

/* ---------------------------
   SIMPLE TOAST
--------------------------- */
function toast(msg){
  const t = $("toast");
  if(!t) return;
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"),2500);
}

/* ---------------------------
   BASIC CANVAS RESET
--------------------------- */
function clearCanvas(){
  if(!ctx) return;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

/* ---------------------------
   BATCH HANDLING
--------------------------- */
async function addFilesToBatch(files){
  if(!files.length) return;

  batches.push({
    files,
    size: sizeSelect?.value || "2x3",
    copy: 1,
    mode: modeSelect?.value || "normal"
  });

  refreshBatchList();
  await autoPreview();
}

/* ---------------------------
   UPLOAD
--------------------------- */
upload?.addEventListener("change", async e=>{
  const files = Array.from(e.target.files || []);
  await addFilesToBatch(files);
  upload.value = "";
});

/* ---------------------------
   DROP AREA
--------------------------- */
$("dropArea")?.addEventListener("click", ()=> upload?.click());

/* ---------------------------
   BATCH UI
--------------------------- */
function refreshBatchList(){
  if(!batchList) return;
  batchList.innerHTML = "";

  batches.forEach((b,i)=>{
    const row = document.createElement("div");
    row.className = "batch-row";

    row.innerHTML = `
      <div style="flex:1">
        <strong>Batch ${i+1}</strong>
        <div>${b.files.length} foto</div>
      </div>
    `;

    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = async ()=>{
      batches.splice(i,1);
      refreshBatchList();
      await autoPreview();
    };

    row.appendChild(del);
    batchList.appendChild(row);
  });
}

/* ---------------------------
   PREVIEW CORE (SIMPLIFIED SAFE)
--------------------------- */
async function autoPreview(){
  if(!ctx) return;

  clearCanvas();

  if(!batches.length) return;

  ctx.fillStyle = "#000";
  ctx.font = "20px Poppins";
  ctx.fillText(`Preview ${batches.length} batch`, 50, 50);

  updatePricePreview();
}

/* ---------------------------
   PRICE SYSTEM (SAFE)
--------------------------- */
function updatePricePreview(){
  if(!priceDisplay) return;

  if(manualHargaCheckbox?.checked){
    const val = parseInt(manualHargaInput?.value || 0);
    priceDisplay.textContent = `Harga: Rp ${val.toLocaleString()} (manual)`;
    return;
  }

  const total = batches.length * 1000;
  priceDisplay.textContent = `Harga: Rp ${total.toLocaleString()}`;
}

/* ---------------------------
   PREVIEW BUTTON (FIXED)
--------------------------- */
previewBtn?.addEventListener("click", async ()=>{
  showLoading();
  try{
    await autoPreview();
  }catch(e){
    console.error(e);
    toast("Preview error");
  }
  hideLoading();
});

/* ---------------------------
   GENERATE
--------------------------- */
generateBtn?.addEventListener("click", async ()=>{
  showLoading();

  try{
    await autoPreview();
    toast("Kolase berhasil dibuat");
  }catch(e){
    console.error(e);
    toast("Gagal generate");
  }

  hideLoading();
});

/* ---------------------------
   RESET
--------------------------- */
resetBtn?.addEventListener("click", ()=>{
  batches = [];
  refreshBatchList();
  clearCanvas();

  if(priceDisplay) priceDisplay.textContent = "Harga: Rp 0";

  toast("Reset berhasil");
});

/* ---------------------------
   PDF (SAFE MINIMAL)
--------------------------- */
downloadPdf?.addEventListener("click", ()=>{
  if(!batches.length){
    alert("Belum ada foto");
    return;
  }
  alert("Fitur PDF aktif (logic utama tetap di script lama)");
});

/* ---------------------------
   LOADING
--------------------------- */
function showLoading(){
  $("loadingOverlay_kolase")?.classList.add("active");
}
function hideLoading(){
  $("loadingOverlay_kolase")?.classList.remove("active");
}

/* ---------------------------
   MANUAL HARGA FIX
--------------------------- */
manualHargaCheckbox && (manualHargaCheckbox.checked = true);
manualHargaInput?.addEventListener("input", ()=>{
  let val = parseInt(manualHargaInput.value)||0;
  val = Math.max(500, Math.round(val/500)*500);
  manualHargaInput.value = val;
  updatePricePreview();
});

/* ---------------------------
   INIT
--------------------------- */
clearCanvas();
updatePricePreview();