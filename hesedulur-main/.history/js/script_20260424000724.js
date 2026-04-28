/* =========================
   FULL FIX PHOTO LAYOUT ENGINE
   ========================= */

   const upload = document.getElementById('upload');
   const canvas = document.getElementById('canvas');
   const ctx = canvas.getContext('2d');
   
   const previewBtn = document.getElementById('previewBtn');
   const generateBtn = document.getElementById('generateBtn');
   const downloadPdf = document.getElementById('downloadPdf');
   const resetBtn = document.getElementById('reset');
   
   const { jsPDF } = window.jspdf;
   
   // ===== STATE =====
   let images = [];
   let placements = [];
   let pages = [];
   let currentPage = 0;
   
   let selected = null;
   let dragging = false;
   let start = null;
   
   let watermarkEnabled = false;
   
   // ===== WATERMARK =====
   const watermarkImg = new Image();
   watermarkImg.src = "";
   
   // =========================
   // LOAD IMAGE
   // =========================
   function loadImage(file) {
     return new Promise(res => {
       const reader = new FileReader();
       reader.onload = e => {
         const img = new Image();
         img.onload = () => res(img);
         img.src = e.target.result;
       };
       reader.readAsDataURL(file);
     });
   }
   
   // =========================
   // UPLOAD
   // =========================
   upload.onchange = async (e) => {
     const files = Array.from(e.target.files);
     for (let f of files) {
       const img = await loadImage(f);
       images.push(img);
     }
     autoLayout();
   };
   
   // =========================
   // AUTO GRID LAYOUT
   // =========================
   function autoLayout() {
     placements = [];
   
     const cols = 3;
     const gap = 20;
     const boxW = (canvas.width - gap*(cols+1)) / cols;
     const boxH = boxW * 1.4;
   
     let x = gap;
     let y = gap;
   
     images.forEach((img, i) => {
       placements.push({
         img,
         x,
         y,
         w: boxW,
         h: boxH,
         scale: 1,
         offsetX: 0,
         offsetY: 0
       });
   
       x += boxW + gap;
       if ((i+1) % cols === 0) {
         x = gap;
         y += boxH + gap;
       }
     });
   
     render();
   }
   
   // =========================
   // DRAW IMAGE COVER
   // =========================
   function drawCover(p) {
     const { img, x, y, w, h, scale, offsetX, offsetY } = p;
   
     const ratio = Math.max(w/img.width, h/img.height);
     const dw = img.width * ratio * scale;
     const dh = img.height * ratio * scale;
   
     const dx = x + (w - dw)/2 + offsetX;
     const dy = y + (h - dh)/2 + offsetY;
   
     ctx.save();
     ctx.beginPath();
     ctx.rect(x, y, w, h);
     ctx.clip();
   
     ctx.drawImage(img, dx, dy, dw, dh);
   
     // watermark
     if (watermarkEnabled && watermarkImg.complete) {
       ctx.globalAlpha = 0.2;
       ctx.drawImage(watermarkImg, x, y, w, h);
       ctx.globalAlpha = 1;
     }
   
     ctx.restore();
   
     ctx.strokeRect(x, y, w, h);
   }
   
   // =========================
   // RENDER
   // =========================
   function render() {
     ctx.fillStyle = "#fff";
     ctx.fillRect(0,0,canvas.width,canvas.height);
   
     placements.forEach(p => drawCover(p));
   }
   
   // =========================
   // DRAG
   // =========================
   canvas.onmousedown = (e) => {
     const rect = canvas.getBoundingClientRect();
     const mx = e.clientX - rect.left;
     const my = e.clientY - rect.top;
   
     selected = placements.find(p =>
       mx >= p.x && mx <= p.x+p.w &&
       my >= p.y && my <= p.y+p.h
     );
   
     if (selected) {
       dragging = true;
       start = {
         x: e.clientX,
         y: e.clientY,
         ox: selected.offsetX,
         oy: selected.offsetY
       };
     }
   };
   
   canvas.onmousemove = (e) => {
     if (!dragging || !selected) return;
   
     const dx = e.clientX - start.x;
     const dy = e.clientY - start.y;
   
     selected.offsetX = start.ox + dx;
     selected.offsetY = start.oy + dy;
   
     render();
   };
   
   canvas.onmouseup = () => dragging = false;
   canvas.onmouseleave = () => dragging = false;
   
   // =========================
   // ZOOM
   // =========================
   canvas.onwheel = (e) => {
     if (!selected) return;
     e.preventDefault();
   
     selected.scale += e.deltaY < 0 ? 0.05 : -0.05;
     selected.scale = Math.max(0.3, selected.scale);
   
     render();
   };
   
   // =========================
   // BUTTONS
   // =========================
   previewBtn.onclick = () => render();
   
   generateBtn.onclick = () => render();
   
   resetBtn.onclick = () => {
     images = [];
     placements = [];
     render();
   };
   
   // =========================
   // PDF
   // =========================
   downloadPdf.onclick = () => {
     const pdf = new jsPDF();
   
     pdf.addImage(canvas.toDataURL("image/jpeg"), 'JPEG', 0, 0, 210, 297);
     pdf.save("cetak.pdf");
   };
   
   // =========================
   // WATERMARK SHORTCUT
   // =========================
   document.addEventListener("keydown", (e) => {
     if (e.altKey && e.key === "w") {
       watermarkEnabled = !watermarkEnabled;
       render();
     }
   });
   
   // =========================
   // INIT
   // =========================
   render();