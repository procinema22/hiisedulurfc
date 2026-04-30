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

/* ===============================
   TOGGLE MARGIN
================================= */
window.toggleMargin = function () {
  const box = document.getElementById("marginSection");

  if (box) {
    box.classList.toggle("show");
  }
};

/* ===============================
   HIDE NAME SWITCH SYSTEM
================================= */
function setupHideNameSwitch() {
  const hideInfo = document.getElementById("hideInfo");
  const userName = document.getElementById("userName");

  if (!hideInfo || !userName) return;

  function applyState() {
    if (hideInfo.checked) {
      userName.value = "";
      userName.disabled = true;
      userName.removeAttribute("required");
      userName.placeholder = "Nama disembunyikan";
      userName.style.opacity = "0.6";
      userName.style.cursor = "not-allowed";
    } else {
      userName.disabled = false;
      userName.setAttribute("required", "required");
      userName.placeholder = "Nama pelanggan";
      userName.style.opacity = "1";
      userName.style.cursor = "text";
    }
  }

  hideInfo.addEventListener("change", applyState);

  applyState();
}

/* ===============================
   GLOBAL VALIDATION
================================= */
window.validateCustomerName = function () {
  const hideInfo = document.getElementById("hideInfo");
  const userName = document.getElementById("userName");

  if (!hideInfo || !userName) return true;

  if (hideInfo.checked) return true;

  if (userName.value.trim() === "") {
    const popup = document.getElementById("popupNotif");
    const popupText = document.getElementById("popupText");

    if (popup && popupText) {
      popupText.textContent = "Nama pelanggan wajib diisi";
      popup.classList.add("show");

      setTimeout(() => {
        popup.classList.remove("show");
      }, 2200);
    }

    userName.focus();
    return false;
  }

  return true;
};

/* ===============================
   INIT APP
================================= */
function initApp() {
  clearCanvas();

  refreshBatchList();

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

  if (manualHargaCheckbox) {
    manualHargaCheckbox.checked = true;
  }

  if (manualHargaBox) {
    manualHargaBox.style.display = "block";
  }

  setupHideNameSwitch();

  console.log("APP READY");
}

window.addEventListener(
  "DOMContentLoaded",
  initApp
);