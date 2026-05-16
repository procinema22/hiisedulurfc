 
/* =====================================
   FILE: js/events.js
   FINAL CLEAN CONTRACT VERSION
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
  userName,
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
   POPUP GLOBAL
===================================== */
window.showPopup = function (
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

  text.textContent = msg;

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

};

/* =====================================
   VALIDASI NAMA
===================================== */

function cekNamaPelanggan() {

  const hideInfo =
    document.getElementById(
      "hideInfo"
    );

  const userName =
    document.getElementById(
      "userName"
    );

  /* =========================
     JIKA HIDE INFO AKTIF
  ========================= */
  if (
    hideInfo?.checked
  ) {

    return true;

  }

  const nama =
    userName?.value?.trim();

  if (!nama) {

    const popup =
      document.getElementById(
        "popupNotif"
      );

    const popupText =
      document.getElementById(
        "popupText"
      );

    if (popup && popupText) {

      popupText.textContent =
        "Nama pelanggan wajib diisi";

      popup.classList.add(
        "show"
      );

      setTimeout(() => {

        popup.classList.remove(
          "show"
        );

      }, 2200);

    }

    userName?.focus();

    return false;

  }

  return true;

}



/* =====================================
   REFRESH UNIVERSAL
===================================== */
async function refreshAll() {

  if (!state.batches.length) {

    updatePricePreview();

    return;

  }

  showLoading();

  try {

    await autoPreview();

    updatePricePreview();

    showPageAtIndex(
      state.currentPageIndex || 0
    );

  }

  catch (err) {

    console.error(err);

  }

  finally {

    hideLoading();

  }

}

/* =====================================
   INIT EVENTS
===================================== */
window.addEventListener(
  "DOMContentLoaded",
  () => {

    /* =========================
       MANUAL PRICE
    ========================= */
    manualHargaCheckbox
      ?.addEventListener(
        "change",
        () => {

          const aktif =
            manualHargaCheckbox
              .checked;

          if (manualHargaBox) {

            manualHargaBox.style.display =
              aktif
                ? "block"
                : "none";

          }

          updatePricePreview();

          

        }
      );

    /* =========================
       HIDE INFO
    ========================= */
    document
      .getElementById(
        "hideInfo"
      )
      ?.addEventListener(
        "change",
        async e => {

          const aktif =
            e.target.checked;

          if (userName) {

            userName.disabled =
              aktif;

            if (aktif) {

              userName.blur();

            }

          }

          

          await refreshAll();

        }
      );

    /* =========================
       PREVIEW
    ========================= */
    previewBtn?.addEventListener(
      "click",
      async () => {
    
        if (!state.batches.length) {
    
          toast(
            "Belum ada foto"
          );
    
          return;
    
        }
    
        await refreshAll();
    
        toast(
          "Preview selesai"
        );
    
      }
    );
    /* =========================
       GENERATE
    ========================= */
    generateBtn?.addEventListener(
      "click",
      async () => {

        if (!state.batches.length) {

          toast(
            "Belum ada foto"
          );

          return;

        }

        if (
          !cekNamaPelanggan()
        ) return;

        await refreshAll();

        toast(
          "Kolase selesai"
        );

      }
    );

    /* =========================
       PDF
    ========================= */
    downloadPdf?.addEventListener(
      "click",
      async () => {

        if (!state.batches.length) {

          toast(
            "Belum ada foto"
          );

          return;

        }

        if (
          !cekNamaPelanggan()
        ) return;

        await refreshAll();

        await openPdfFile();

        toast(
          "PDF berhasil dibuat"
        );

      }
    );

    /* =========================
       RESET
    ========================= */
    document
      .getElementById(
        "reset"
      )
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

    /* =========================
       PAGE NAV
    ========================= */
    prevPageBtn
      ?.addEventListener(
        "click",
        () => {

          showPageAtIndex(
            state.currentPageIndex - 1
          );

        }
      );

    nextPageBtn
      ?.addEventListener(
        "click",
        () => {

          showPageAtIndex(
            state.currentPageIndex + 1
          );

        }
      );

    /* =========================
       MODE
    ========================= */
    modeSelect
      ?.addEventListener(
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

          await refreshAll();

        }
      );

    /* =========================
       SIZE
    ========================= */
    sizeSelect
      ?.addEventListener(
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

          await refreshAll();

        }
      );

    /* =========================
       LIVE INPUT
    ========================= */
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
        refreshAll
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
      e.clientX - rect.left;

    const my =
      e.clientY - rect.top;

    const page =
      state.placementsByPage[
        state.currentPageIndex
      ] || [];

    state.selectedPlacement =
      null;

    for (const item of page) {

      /* =====================
         RECTANGLE
      ===================== */
      if (
        item.type ===
        "rectangle"
      ) {

        const x =
          item.x *
          PREVIEW_SCALE;

        const y =
          item.y *
          PREVIEW_SCALE;

        const w =
          item.width *
          PREVIEW_SCALE;

        const h =
          item.height *
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

      /* =====================
         CIRCLE
      ===================== */
      else if (
        item.type ===
        "circle"
      ) {

        const r =
          item.diameter *
          PREVIEW_SCALE /
          2;

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

        if (dist <= r) {

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
            .offsetX,

        oy:
          state
            .selectedPlacement
            .offsetY

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
      ) / PREVIEW_SCALE;

    const dy =
      (
        e.clientY -
        state.dragStart.y
      ) / PREVIEW_SCALE;

    state.selectedPlacement.offsetX =
      state.dragStart.ox + dx;

    state.selectedPlacement.offsetY =
      state.dragStart.oy + dy;

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
   ZOOM
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
        .scale;

    scale +=
      e.deltaY < 0
        ? 0.05
        : -0.05;

    if (scale < 0.2)
      scale = 0.2;

    if (scale > 5)
      scale = 5;

    state.selectedPlacement.scale =
      scale;

    await renderAllPages();

    showPageAtIndex(
      state.currentPageIndex
    );

  },
  { passive:false }
);

