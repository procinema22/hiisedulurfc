/* =====================================
   FILE: js/events.js
   FINAL MODULE VERSION
   UI Events + Drag + Zoom
===================================== */
console.log("EVENTS NEW VERSION LOADED");

import {
  upload,
  canvas,
  previewBtn,
  generateBtn,
  downloadPdf,
  resetBtn,
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

    /* manual price */
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

    /* preview */
    previewBtn?.addEventListener(
      "click",
      async () => {

        if (
          !state.batches.length
        ) {
          toast(
            "Belum ada foto"
          );
          return;
        }

        if (
          !cekNamaPelanggan()
        ) return;

        showLoading();

        try {

          await autoPreview();

          toast(
            "Preview selesai"
          );

        } catch (err) {

          console.error(
            err
          );

          toast(
            "Preview gagal"
          );

        } finally {

          hideLoading();

        }

      }
    );

    /* generate */
    generateBtn?.addEventListener(
      "click",
      async () => {

        if (
          !state.batches.length
        ) {
          toast(
            "Belum ada foto"
          );
          return;
        }

        if (
          !cekNamaPelanggan()
        ) return;

        showLoading();

        try {

          await autoPreview();

          toast(
            "Kolase selesai"
          );

        } catch (err) {

          toast(
            "Generate gagal"
          );

        } finally {

          hideLoading();

        }

      }
    );

    /* pdf */
    downloadPdf?.addEventListener(
      "click",
      async () => {

        await openPdfFile();

      }
    );

    document
  .getElementById("reset")
  ?.addEventListener(
    "click",
    () => {

      resetState();
      refreshBatchList();
      clearCanvas();
      updatePricePreview();

      if (pageNav)
        pageNav.style.display = "none";

      if (upload)
        upload.value = "";

      toast("Reset selesai");

    }
  );

    /* page nav */
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

    /* mode change */
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

    /* size change */
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

    /* live preview */
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

      if (
        item.isRectangle
      ) {

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
   POPUP
===================================== */
function showPopup(
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
    setTimeout(() => {
      popup.classList.remove(
        "show"
      );
    }, 2200);

}

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