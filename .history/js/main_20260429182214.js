/* =====================================
   FILE: js/main.js
   ENTRY POINT APP
===================================== */

import {
  pageNav,
  circleControls,
  modeSelect,
  customSize,
  sizeSelect,
  manualHargaCheckbox,
  manualHargaBox,
  manualHargaInput,
  priceDisplay
} from "./state.js";

import {
  clearCanvas
} from "./helpers.js";

import {
  refreshBatchList
} from "./batch.js";

import "./upload.js";
import "./layout.js";
import "./render.js";
import "./pdf.js";
import "./events.js";

/* =====================================
   TOGGLE MARGIN PANEL
===================================== */
window.toggleMargin = function () {

  const box =
    document.getElementById(
      "marginSection"
    );

  if (!box) return;

  box.classList.toggle("show");
};

/* =====================================
   INIT APP
===================================== */
function initApp() {

  clearCanvas();

  refreshBatchList();

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

  if (manualHargaCheckbox) {
    manualHargaCheckbox.checked =
      true;
  }

  if (manualHargaBox) {
    manualHargaBox.style.display =
      "block";
  }

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
    "APP READY"
  );
}

window.addEventListener(
  "load",
  initApp
);