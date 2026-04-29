/* =====================================
   FILE: js/main.js
   APP ENTRY POINT
===================================== */

console.log("MAIN APP LOADED");

import "./state.js";
import "./helpers.js";
import "./batch.js";
import "./layout.js";
import "./render.js";
import "./upload.js";
import "./pdf.js";
import "./events.js";

import {
  pageNav,
  circleControls,
  modeSelect,
  customSize,
  sizeSelect,
  manualHargaCheckbox,
  manualHargaBox
} from "./state.js";

import {
  clearCanvas
} from "./helpers.js";

import {
  refreshBatchList,
  updatePricePreview
} from "./batch.js";

/* toggle margin */
window.toggleMargin = function () {
  const box =
    document.getElementById(
      "marginSection"
    );

  if (box)
    box.classList.toggle(
      "show"
    );
};

/* init */
function initApp() {

  clearCanvas();

  refreshBatchList();

  updatePricePreview();

  if (pageNav)
    pageNav.style.display =
      "none";

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

  if (manualHargaCheckbox)
    manualHargaCheckbox.checked = true;

  if (manualHargaBox)
    manualHargaBox.style.display = "block";

  console.log("APP READY");
}

window.addEventListener(
  "DOMContentLoaded",
  initApp
);