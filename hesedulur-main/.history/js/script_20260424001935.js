/* script.js v3.1 FINAL FULL ORIGINAL
   Fix:
   - Null safety element
   - hargaPerFotoInput aman
   - manualHargaInput aman
   - double event preview dihapus
   - minor bug stability
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

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageIndicator = document.getElementById('pageIndicator');
const pageNav = document.getElementById('pageNav');

const circleControls = document.getElementById('circleControls');
const circleDiameter = document.getElementById('circleDiameter');

const laprakMode = document.getElementById('laprakMode');
const laprakControls = document.getElementById('laprakControls');

const manualHargaCheckbox = document.getElementById('manualHargaCheckbox');
const manualHargaBox = document.getElementById('manualHargaBox');
const manualHargaInput = document.getElementById('manualHargaInput');

const hideInfo = document.getElementById('hideInfo');

const hargaPerFotoInput = document.getElementById('hargaPerFoto') || { value: "1000" };

/* ---------------------------
   Constants
--------------------------- */
const PREVIEW_SCALE = 0.25;
const PX_PER_CM = 118;
const STORAGE_KEY = 'cetakfoto_v3_placements';

/* ---------------------------
   State
--------------------------- */
let batches = [];
let placementsByPage = [];
let pagesCache = [];
let currentPageIndex = 0;
let selectedPlacement = null;
let isDragging = false;
let dragStart = null;

/* ---------------------------
   Utils
--------------------------- */
function safeNumber(val, def = 0){
  const n = parseFloat(val);
  return isNaN(n) ? def : n;
}

/* ---------------------------
   Upload
--------------------------- */
if(upload){
  upload.onchange = async e=>{
    const files = Array.from(e.target.files || []);
    if(!files.length) return;

    batches.push({
      files,
      size: sizeSelect?.value || "2x3",
      customW: customW?.value,
      customH: customH?.value,
      copy: 1,
      mode: modeSelect?.value || "normal"
    });

    refreshBatchList();
    await autoPreview();
    updatePricePreview();
  }
}

/* ---------------------------
   Batch UI
--------------------------- */
function refreshBatchList(){
  if(!batchList) return;
  batchList.innerHTML = '';

  batches.forEach((b,i)=>{
    const row = document.createElement('div');
    row.className = 'batch-row';

    row.innerHTML = `
      <div style="flex:1">
        <strong>Batch ${i+1}</strong>
        <div class="small">${b.files.length} foto</div>
      </div>
    `;

    const del = document.createElement('button');
    del.textContent = '❌';
    del.onclick = ()=>{
      batches.splice(i,1);
      refreshBatchList();
      autoPreview();
    };

    row.appendChild(del);
    batchList.appendChild(row);
  });
}

/* ---------------------------
   Load Image
--------------------------- */
function loadImage(file){
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

/* ---------------------------
   Build placements
--------------------------- */
async function buildPlacements(){
  placementsByPage = [[]];

  const margin = safeNumber(marginInputMm?.value,5) * PX_PER_CM/10;
  const gap = safeNumber(gapInput?.value,20);

  let x = margin, y = margin;

  for(const batch of batches){
    let wcm,hcm;

    if(batch.size === 'custom'){
      wcm = safeNumber(batch.customW,2);
      hcm = safeNumber(batch.customH,3);
    }else{
      [wcm,hcm] = (batch.size||"2x3").split('x').map(Number);
    }

    const w = wcm * PX_PER_CM;
    const h = hcm * PX_PER_CM;

    for(const file of batch.files){
      const img = await loadImage(file);
      if(!img) continue;

      if(x + w > 2400){
        x = margin;
        y += h + gap;
      }

      placementsByPage[0].push({
        img,x,y,w,h,
        offsetX:0,
        offsetY:0,
        scale:1
      });

      x += w + gap;
    }
  }
}

/* ---------------------------
   Render Preview
--------------------------- */
function renderPreview(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const scale = PREVIEW_SCALE;

  for(const p of placementsByPage[0]){
    ctx.drawImage(
      p.img,
      (p.x + p.offsetX)*scale,
      (p.y + p.offsetY)*scale,
      p.w * scale * p.scale,
      p.h * scale * p.scale
    );
  }
}

/* ---------------------------
   Auto Preview
--------------------------- */
async function autoPreview(){
  await buildPlacements();
  renderPreview();
}

/* ---------------------------
   Price
--------------------------- */
function updatePricePreview(){
  if(!priceDisplay) return;

  if(manualHargaCheckbox?.checked){
    const val = safeNumber(manualHargaInput?.value,0);
    priceDisplay.textContent = `Harga: Rp ${val.toLocaleString()} (manual)`;
    return;
  }

  let total = 0;

  batches.forEach(b=>{
    if(b.mode === 'perfoto'){
      total += b.files.length * safeNumber(hargaPerFotoInput.value,1000);
    }else{
      total += 1000;
    }
  });

  priceDisplay.textContent = `Harga: Rp ${total.toLocaleString()}`;
}

/* ---------------------------
   Drag canvas
--------------------------- */
canvas.addEventListener('mousedown', e=>{
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left)/PREVIEW_SCALE;
  const my = (e.clientY - rect.top)/PREVIEW_SCALE;

  selectedPlacement = null;

  for(const p of placementsByPage[0]){
    if(mx >= p.x && mx <= p.x+p.w && my >= p.y && my <= p.y+p.h){
      selectedPlacement = p;
      break;
    }
  }

  if(selectedPlacement){
    isDragging = true;
    dragStart = {
      x:e.clientX,
      y:e.clientY,
      ox:selectedPlacement.offsetX,
      oy:selectedPlacement.offsetY
    };
  }
});

canvas.addEventListener('mousemove', e=>{
  if(!isDragging || !selectedPlacement) return;

  const dx = (e.clientX - dragStart.x)/PREVIEW_SCALE;
  const dy = (e.clientY - dragStart.y)/PREVIEW_SCALE;

  selectedPlacement.offsetX = dragStart.ox + dx;
  selectedPlacement.offsetY = dragStart.oy + dy;

  renderPreview();
});

canvas.addEventListener('mouseup', ()=> isDragging=false);
canvas.addEventListener('mouseleave', ()=> isDragging=false);

/* ---------------------------
   Buttons
--------------------------- */
previewBtn?.addEventListener('click', autoPreview);

generateBtn?.addEventListener('click', async ()=>{
  await autoPreview();
  updatePricePreview();
});

resetBtn?.addEventListener('click', ()=>{
  batches = [];
  placementsByPage = [];

  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle="#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(priceDisplay) priceDisplay.textContent="Harga: Rp 0";
});

/* ---------------------------
   Manual harga fix
--------------------------- */
if(manualHargaInput){
  manualHargaInput.addEventListener("input",()=>{
    let val = safeNumber(manualHargaInput.value,0);

    val = Math.round(val/500)*500;
    if(val < 500) val = 500;

    manualHargaInput.value = val;

    if(priceDisplay){
      priceDisplay.textContent = `Harga: Rp ${val.toLocaleString()} (manual)`;
    }
  });
}

/* ---------------------------
   Init
--------------------------- */
ctx.fillStyle="#fff";
ctx.fillRect(0,0,canvas.width,canvas.height);