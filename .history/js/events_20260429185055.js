/* =====================================
   FILE: js/events.js
   FINAL PRODUCTION VERSION
   UI Events + Drag + Zoom + Popup
===================================== */

console.log("EVENTS FINAL LOADED");

import {
  upload,
  canvas,
  previewBtn,
  generateBtn,
  downloadPdf,
  pageNav,
  prevPageBtn,
  nextPageBtn,
  modeSelect,
  circleControls,
  circleDiameter,
  sizeSelect,
  customSize,
  customW,
  customH,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  gapInput,
  manualHargaCheckbox,
  manualHargaBox,
  manualHargaInput,
  userName,
  priceDisplay,
  state,
  PREVIEW_SCALE,
  resetState
} from "./state.js";

import {
  refreshBatchList,
  updatePricePreview
} from "./batch.js";

import {
  autoPreview
} from "./layout.js";

import {
  showPageAtIndex,
  renderAllPages
} from "./render.js";

import {
  openPdfFile
} from "./pdf.js";

import {
  clearCanvas,
  toast,
  showLoading,
  hideLoading
} from "./helpers.js";

/* =====================================
   INIT EVENTS
===================================== */
window.addEventListener(
  "DOMContentLoaded",
  () => {

    /* ---------------------------
       MANUAL HARGA
    --------------------------- */
    manualHargaCheckbox?.addEventListener(
      "change",
      () => {

        const aktif =
          manualHargaCheckbox.checked;

        if (manualHargaBox) {
          manualHargaBox.style.display =
            aktif
              ? "block"
              : "none";
        }

        if (aktif) {

          const harga =
            parseInt(
              manualHargaInput?.value
            ) || 500;

          if (priceDisplay) {
            priceDisplay.textContent =
              "Harga: Rp " +
              harga.toLocaleString(
                "id-ID"
              );
          }

          showPopup(
            "Harga manual aktif"
          );

        } else {

          updatePricePreview();

          showPopup(
            "Harga otomatis aktif"
          );

        }

      }
    );

    /* ---------------------------
       PREVIEW
    --------------------------- */
    previewBtn?.addEventListener(
      "click",
      async () => {

        if (!state.batches.length) {
          toast("Belum ada foto");
          return;
        }

        if (!cekNamaPelanggan())
          return;

        showLoading();

        try {

          await autoPreview();

          toast(
            "Preview selesai"
          );

        } catch (err) {

          console.error(err);

          toast(
            "Preview gagal"
          );

        } finally {

          hideLoading();

        }

      }
    );

    /* ---------------------------
       GENERATE
    --------------------------- */
    generateBtn?.addEventListener(
      "click",
      async () => {

        if (!state.batches.length) {
          toast("Belum ada foto");
          return;
        }

        if (!cekNamaPelanggan())
          return;

        showLoading();

        try {

          await autoPreview();

          toast(
            "Kolase selesai"
          );

        } catch (err) {

          console.error(err);

          toast(
            "Generate gagal"
          );

        } finally {

          hideLoading();

        }

      }
    );

    /* ---------------------------
       PDF
    --------------------------- */
    downloadPdf?.addEventListener(
      "click",
      async () => {

        await openPdfFile();

      }
    );

    /* ---------------------------
       RESET
    --------------------------- */
    document
      .getElementById("reset")
      ?.addEventListener(
        "click",
        () => {

          resetState();

          refreshBatchList();

          clearCanvas();

          updatePricePreview();

          if (pageNav) {
            pageNav.style.display =
              "none";
          }

          if (upload) {
            upload.value = "";
          }

          toast(
            "Reset selesai"
          );

        }
      );

    /* ---------------------------
       PAGE NAV
    --------------------------- */
    prevPageBtn?.addEventListener(
      "click",
      () => {

        showPageAtIndex(
          state.currentPageIndex - 1
        );

      }
    );

    nextPageBtn?.addEventListener(
      "click",
      () => {

        showPageAtIndex(
          state.currentPageIndex + 1
        );

      }
    );

    /* ---------------------------
       MODE CHANGE
    --------------------------- */
    modeSelect?.addEventListener(
      "change",
      async () => {

        if (circleControls) {
          circleControls.style.display =
            modeSelect.value ===
            "circle"
              ? "block"
              : "none";
        }

        if (customSize) {
          customSize.style.display =
            sizeSelect?.value ===
              "custom" &&
            modeSelect.value !==
              "circle"
              ? "flex"
              : "none";
        }

        if (
          state.batches.length
        ) {
          await autoPreview();
        }

      }
    );

    /* ---------------------------
       SIZE CHANGE
    --------------------------- */
    sizeSelect?.addEventListener(
      "change",
      async () => {

        if (customSize) {
          customSize.style.display =
            sizeSelect.value ===
              "custom" &&
            modeSelect?.value !==
              "circle"
              ? "flex"
              : "none";
        }

        if (
          state.batches.length
        ) {
          await autoPreview();
        }

      }
    );

    /* ---------------------------
       LIVE UPDATE
    --------------------------- */
    [
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      gapInput,
      customW,
      customH,
      circleDiameter
    ].forEach(el => {

      el?.addEventListener(
        "input",
        async () => {

          if (
            state.batches.length
          ) {
            await autoPreview();
          }

        }
      );

    });

  }
);

/* =====================================
   DRAG START
===================================== */
canvas?.addEventListener(
  "mousedown",
  e => {

    const rect =
      canvas.getBoundingClientRect();

    const mx =
      e.clientX -
      rect.left;

    const my =
      e.clientY -
      rect.top;

    const page =
      state
        .placementsByPage[
        state.currentPageIndex
      ] || [];

    state.selectedPlacement =
      null;

    for (const item of page) {

      /* rectangle */
      if (item.isRectangle) {

        const x =
          item.x *
          PREVIEW_SCALE;

        const y =
          item.y *
          PREVIEW_SCALE;

        const w =
          item.boxW *
          PREVIEW_SCALE;

        const h =
          item.boxH *
          PREVIEW_SCALE;

        if (
          mx >= x &&
          mx <= x + w &&
          my >= y &&
          my <= y + h
        ) {

          state.selectedPlacement =
            item;

          break;

        }

      }

      /* circle */
      else if (
        item.isCircle
      ) {

        const r =
          (
            item.diameterPx *
            PREVIEW_SCALE
          ) / 2;

        const cx =
          item.x *
            PREVIEW_SCALE +
          r;

        const cy =
          item.y *
            PREVIEW_SCALE +
          r;

        const dist =
          Math.hypot(
            mx - cx,
            my - cy
          );

        if (
          dist <= r
        ) {

          state.selectedPlacement =
            item;

          break;

        }

      }

    }

    if (
      state.selectedPlacement
    ) {

      state.isDragging =
        true;

      state.dragStart = {
        x: e.clientX,
        y: e.clientY,
        ox:
          state
            .selectedPlacement
            .offsetX || 0,
        oy:
          state
            .selectedPlacement
            .offsetY || 0
      };

    }

  }
);

/* =====================================
   DRAG MOVE
===================================== */
canvas?.addEventListener(
  "mousemove",
  async e => {

    if (
      !state.isDragging ||
      !state.selectedPlacement
    ) return;

    const dx =
      (
        e.clientX -
        state.dragStart.x
      ) /
      PREVIEW_SCALE;

    const dy =
      (
        e.clientY -
        state.dragStart.y
      ) /
      PREVIEW_SCALE;

    state
      .selectedPlacement
      .offsetX =
      state.dragStart.ox +
      dx;

    state
      .selectedPlacement
      .offsetY =
      state.dragStart.oy +
      dy;

    await renderAllPages();

    showPageAtIndex(
      state.currentPageIndex
    );

  }
);

/* =====================================
   DRAG END
===================================== */
canvas?.addEventListener(
  "mouseup",
  () => {

    state.isDragging =
      false;

  }
);

canvas?.addEventListener(
  "mouseleave",
  () => {

    state.isDragging =
      false;

  }
);

/* =====================================
   WHEEL ZOOM
===================================== */
canvas?.addEventListener(
  "wheel",
  async e => {

    if (
      !state.selectedPlacement
    ) return;

    e.preventDefault();

    let scale =
      state
        .selectedPlacement
        .scale || 1;

    scale +=
      e.deltaY < 0
        ? 0.05
        : -0.05;

    if (scale < 0.2)
      scale = 0.2;

    if (scale > 5)
      scale = 5;

    state
      .selectedPlacement
      .scale =
      scale;

    await renderAllPages();

    showPageAtIndex(
      state.currentPageIndex
    );

  },
  { passive:false }
);

/* =====================================
   POPUP GLOBAL
===================================== */
window.showPopup = function(
  msg = "Notifikasi"
) {

  const popup =
    document.getElementById(
      "popupNotif"
    );

  const text =
    document.getElementById(
      "popupText"
    );

  if (!popup || !text)
    return;

  text.textContent =
    msg;

  popup.classList.add(
    "show"
  );

  clearTimeout(
    window.popupTimer
  );

  window.popupTimer =
    setTimeout(
      () => {

        popup.classList.remove(
          "show"
        );

      },
      2200
    );

};

/* =====================================
   VALIDASI NAMA
===================================== */
function cekNamaPelanggan() {

  const nama =
    userName?.value
      .trim();

  if (!nama) {

    showPopup(
      "Nama pelanggan wajib diisi"
    );

    userName?.focus();

    return false;

  }

  return true;

}