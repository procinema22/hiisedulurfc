/* =====================================
   FILE: js/main.js
   FINAL CLEAN VERSION
   Startup / Utility Only
===================================== */

/* ---------------------------
   TOGGLE MARGIN PANEL
   dipanggil dari HTML:
   onclick="toggleMargin()"
--------------------------- */
function toggleMargin() {

  const box =
    document.getElementById(
      "marginSection"
    );

  if (!box) return;

  const isOpen =
    box.classList.contains(
      "show"
    );

  if (isOpen) {
    box.classList.remove(
      "show"
    );
  } else {
    box.classList.add(
      "show"
    );
  }
}

/* ---------------------------
   INIT APP
--------------------------- */
function initApp() {

  /* kosongkan canvas */
  clearCanvas();

  /* refresh list */
  refreshBatchList();

  /* harga awal */
  updatePricePreview();

  /* nav hidden */
  if (pageNav) {
    pageNav.style.display =
      "none";
  }

  /* mode circle */
  if (circleControls) {
    circleControls.style.display =
      modeSelect?.value ===
      "circle"
        ? "block"
        : "none";
  }

  /* custom size */
  if (customSize) {
    customSize.style.display =
      sizeSelect?.value ===
      "custom" &&
      modeSelect?.value !==
        "circle"
        ? "flex"
        : "none";
  }

  /* harga manual permanen */
  if (manualHargaCheckbox) {
    manualHargaCheckbox.checked =
      true;
  }

  if (manualHargaBox) {
    manualHargaBox.style.display =
      "block";
  }

  /* isi harga awal */
  if (
    manualHargaInput &&
    priceDisplay
  ) {

    const harga =
      parseInt(
        manualHargaInput.value
      ) || 500;

    priceDisplay.textContent =
      "Harga: Rp " +
      harga.toLocaleString(
        "id-ID"
      );
  }

  console.log(
    "SEDULUR FOTO COPY READY"
  );
}

/* ---------------------------
   START
--------------------------- */
window.addEventListener(
  "load",
  initApp
);