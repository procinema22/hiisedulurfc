/* =====================================
   FILE: js/helpers.js
   Utility Functions
===================================== */

/* ---------------------------
   Format Rupiah
--------------------------- */
function formatRupiah(value) {
    const num = parseInt(value) || 0;
    return "Rp " + num.toLocaleString("id-ID");
  }
  
  /* ---------------------------
     Ambil angka aman
  --------------------------- */
  function num(val, fallback = 0) {
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  }
  
  /* ---------------------------
     Clamp number
  --------------------------- */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }
  
  /* ---------------------------
     Delay async
  --------------------------- */
  function wait(ms = 200) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
  
  /* ---------------------------
     Toast sederhana
  --------------------------- */
  function toast(msg = "Sukses") {
    const el = document.getElementById("toast");
    if (!el) return;
  
    el.textContent = msg;
    el.classList.add("show");
  
    setTimeout(() => {
      el.classList.remove("show");
    }, 2200);
  }
  
  /* ---------------------------
     Loading Overlay
  --------------------------- */
  function showLoading() {
    const el =
      document.getElementById("loadingOverlay");
  
    if (el) el.classList.add("show");
  }
  function hideLoading() {
    const el =
      document.getElementById("loadingOverlay");
  
    if (el) el.classList.remove("show");
  }
  /* ---------------------------
     Clear Canvas
  --------------------------- */
  function clearCanvas() {
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }
  
  /* ---------------------------
     Load Image from File
  --------------------------- */
  function loadImage(file) {
    return new Promise((resolve) => {
      if (!file) return resolve(null);
  
      const reader = new FileReader();
  
      reader.onload = e => {
        const img = new Image();
  
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
  
        img.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  /* ---------------------------
     Download Blob
  --------------------------- */
  function openBlob(blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
  
  /* ---------------------------
     Get Margin PX
  --------------------------- */
  function getMarginsPx() {
    return {
      top:
        num(marginTop?.value) / 10 * PX_PER_CM,
  
      bottom:
        num(marginBottom?.value) / 10 * PX_PER_CM,
  
      left:
        num(marginLeft?.value) / 10 * PX_PER_CM,
  
      right:
        num(marginRight?.value) / 10 * PX_PER_CM
    };
  }
  
  /* ---------------------------
     Gap PX
  --------------------------- */
  function getGap() {
    return Math.max(
      0,
      parseInt(gapInput?.value) || 20
    );
  }