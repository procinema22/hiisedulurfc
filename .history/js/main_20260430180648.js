/* =====================================
   FILE: js/main.js
   FIX DEFAULT AUTO PRICE MODE
===================================== */

/* ===============================
   INIT APP
================================= */
function initApp() {
  clearCanvas();

  refreshBatchList();

  /* ==========================
     DEFAULT HARGA OTOMATIS
  ========================== */
  if (manualHargaCheckbox) {
    manualHargaCheckbox.checked = false;
  }

  if (manualHargaBox) {
    manualHargaBox.style.display = "none";
  }

  updatePricePreview();

  if (pageNav) {
    pageNav.style.display = "none";
  }

  if (circleControls) {
    circleControls.style.display =
      modeSelect?.value === "circle"
        ? "block"
        : "none";
  }

  if (customSize) {
    customSize.style.display =
      sizeSelect?.value === "custom"
        ? "flex"
        : "none";
  }

  setupHideNameSwitch();

  console.log("APP READY");
}