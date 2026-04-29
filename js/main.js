/* =====================================
   FILE: js/main.js
   Init / Startup
===================================== */

/* ---------------------------
   Toggle Manual Harga Box
--------------------------- */
if (
    manualHargaCheckbox &&
    manualHargaBox
  ) {
    manualHargaCheckbox.onchange =
      () => {
  
        manualHargaBox.style.display =
          manualHargaCheckbox.checked
            ? "block"
            : "none";
  
        updatePricePreview();
      };
  
    /* init pertama */
    manualHargaBox.style.display =
      manualHargaCheckbox.checked
        ? "block"
        : "none";
  }
  
  /* ---------------------------
     Toggle Margin Accordion
     dipanggil dari HTML:
     onclick="toggleMargin()"
  --------------------------- */
  function toggleMargin() {
  
    const box =
      document.getElementById(
        "marginSection"
      );
  
    if (!box) return;
  
    const open =
      box.style.display ===
      "block";
  
    box.style.display =
      open ? "none" : "block";
  }
  
  /* ---------------------------
     First Render
  --------------------------- */
  function initApp() {
  
    clearCanvas();
  
    refreshBatchList();
  
    updatePricePreview();
  
    if (pageNav) {
      pageNav.style.display =
        "none";
    }
  
    if (circleControls) {
      circleControls.style.display =
        modeSelect?.value ===
        "circle"
          ? "block"
          : "none";
    }
  
    if (customSize) {
      customSize.style.display =
        sizeSelect?.value ===
        "custom"
          ? "flex"
          : "none";
    }
  
    console.log(
      "SEDULUR FOTO COPY READY"
    );
  }
  
  /* ---------------------------
     Jalankan
  --------------------------- */
  initApp();