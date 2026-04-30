/* =====================================
   FILE: js/events.js
   FINAL PRODUCTION VERSION
   AUTO PRICE LIVE UPDATE
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

    /* MANUAL PRICE SWITCH */
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

        updatePricePreview();

        showPopup(
          aktif
            ? "Harga manual aktif"
            : "Harga otomatis aktif"
        );

      }
    );

    /* PREVIEW */
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
          updatePricePreview();

          toast(
            "Preview selesai"
          );

        } catch (err) {

          console.error(err);
          toast("Preview gagal");

        } finally {

          hideLoading();

        }

      }
    );

    /* GENERATE */
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
          updatePricePreview();

          toast(
            "Kolase selesai"
          );

        } catch (err) {

          console.error(err);
          toast("Generate gagal");

        } finally {

          hideLoading();

        }

      }
    );

    /* PDF */
    downloadPdf?.addEventListener(
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
          updatePricePreview();

          await openPdfFile();

          toast(
            "PDF berhasil dibuat"
          );

        } catch (err) {

          console.error(err);
          toast("Gagal membuka PDF");

        } finally {

          hideLoading();

        }

      }
    );

    /* RESET */
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

    /* PAGE NAV */
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

    /* MODE CHANGE */
    modeSelect?.addEventListener(
      "change",
      async () => {

        if (circleControls) {
          circleControls.style.display =
            modeSelect.value === "circle"
              ? "block"
              : "none";
        }

        if (customSize) {
          customSize.style.display =
            sizeSelect?.value === "custom" &&
            modeSelect.value !== "circle"
              ? "flex"
              : "none";
        }

        if (state.batches.length) {
          await autoPreview();
          updatePricePreview();
        }

      }
    );

    /* SIZE CHANGE */
    sizeSelect?.addEventListener(
      "change",
      async () => {

        if (customSize) {
          customSize.style.display =
            sizeSelect.value === "custom" &&
            modeSelect?.value !== "circle"
              ? "flex"
              : "none";
        }

        if (state.batches.length) {
          await autoPreview();
          updatePricePreview();
        }

      }
    );

    /* LIVE UPDATE */
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

          if (state.batches.length) {
            await autoPreview();
            updatePricePreview();
          }

        }
      );

    });

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
      (e.clientX -
        state.dragStart.x) /
      PREVIEW_SCALE;

    const dy =
      (e.clientY -
        state.dragStart.y) /
      PREVIEW_SCALE;

    state.selectedPlacement.offsetX =
      state.dragStart.ox + dx;

    state.selectedPlacement.offsetY =
      state.dragStart.oy + dy;

    await renderAllPages();
    updatePricePreview();

    showPageAtIndex(
      state.currentPageIndex
    );

  }
);

/* =====================================
   ZOOM
===================================== */
canvas?.addEventListener(
  "wheel",
  async e => {

    if (!state.selectedPlacement)
      return;

    e.preventDefault();

    let scale =
      state.selectedPlacement.scale || 1;

    scale +=
      e.deltaY < 0
        ? 0.05
        : -0.05;

    if (scale < 0.2) scale = 0.2;
    if (scale > 5) scale = 5;

    state.selectedPlacement.scale =
      scale;

    await renderAllPages();
    updatePricePreview();

    showPageAtIndex(
      state.currentPageIndex
    );

  },
  { passive:false }
);

/* =====================================
   VALIDASI NAMA
===================================== */
function cekNamaPelanggan() {

  if (
    document.getElementById("hideInfo")
      ?.checked
  ) {
    return true;
  }

  const nama =
    userName?.value?.trim();

  if (!nama) {

    showPopup(
      "Nama pelanggan wajib diisi"
    );

    userName?.focus();

    return false;
  }

  return true;
}