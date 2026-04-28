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
}