/* =====================================
   FILE: js/events.js
   FINAL PRODUCTION VERSION
===================================== */

import {
  upload,
  canvas,
  batchList,
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
  renderAllPages,
  showPageAtIndex
} from "./render.js";

import {
  refreshBatchList,
  autoPreview,
  updatePricePreview,
  openPdfFile,
  clearCanvas,
  showLoading,
  hideLoading,
  toast
} from "./main.js";

/* =====================================
   INIT EVENTS
===================================== */
window.addEventListener("load", () => {

  /* ---------------------------
     MANUAL PRICE
  --------------------------- */
  manualHargaCheckbox?.addEventListener("change", () => {

    const aktif = manualHargaCheckbox.checked;

    if (manualHargaBox) {
      manualHargaBox.style.display =
        aktif ? "block" : "none";
    }

    if (aktif) {
      const harga =
        parseInt(manualHargaInput?.value) || 500;

      if (priceDisplay) {
        priceDisplay.textContent =
          "Harga: Rp " +
          harga.toLocaleString("id-ID");
      }

      showPopup("Harga manual aktif");

    } else {
      updatePricePreview();
      showPopup("Harga otomatis aktif");
    }

  });

  manualHargaInput?.addEventListener("input", () => {

    if (!manualHargaCheckbox.checked) return;

    let harga =
      parseInt(manualHargaInput.value) || 0;

    if (harga < 500) harga = 500;

    manualHargaInput.value = harga;

    if (priceDisplay) {
      priceDisplay.textContent =
        "Harga: Rp " +
        harga.toLocaleString("id-ID");
    }

  });

  /* ---------------------------
     PREVIEW
  --------------------------- */
  previewBtn?.addEventListener("click", async () => {

    if (!state.batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await autoPreview();
      toast("Preview selesai");
    } catch (err) {
      console.error(err);
      toast("Preview gagal");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     GENERATE
  --------------------------- */
  generateBtn?.addEventListener("click", async () => {

    if (!state.batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await autoPreview();
      toast("Kolase selesai");
    } catch (err) {
      console.error(err);
      toast("Generate gagal");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     PDF
  --------------------------- */
  downloadPdf?.addEventListener("click", async () => {

    if (!state.batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await openPdfFile();
      toast("PDF dibuka");
    } catch (err) {
      console.error(err);
      toast("Gagal buka PDF");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     RESET
  --------------------------- */
  resetBtn?.addEventListener("click", () => {

    resetState();

    refreshBatchList();
    clearCanvas();
    updatePricePreview();

    if (pageNav) pageNav.style.display = "none";
    if (upload) upload.value = "";
    if (userName) userName.value = "";

    if (manualHargaCheckbox)
      manualHargaCheckbox.checked = false;

    if (manualHargaBox)
      manualHargaBox.style.display = "none";

    if (manualHargaInput)
      manualHargaInput.value = 500;

    toast("Reset selesai");

  });

  /* ---------------------------
     PAGE NAV
  --------------------------- */
  prevPageBtn?.addEventListener("click", () => {
    showPageAtIndex(
      state.currentPageIndex - 1
    );
  });

  nextPageBtn?.addEventListener("click", () => {
    showPageAtIndex(
      state.currentPageIndex + 1
    );
  });

  /* ---------------------------
     MODE CHANGE
  --------------------------- */
  modeSelect?.addEventListener("change", async () => {

    const mode = modeSelect.value;

    if (circleControls) {
      circleControls.style.display =
        mode === "circle"
          ? "block"
          : "none";
    }

    if (customSize) {
      customSize.style.display =
        mode !== "circle" &&
        sizeSelect?.value === "custom"
          ? "flex"
          : "none";
    }

    if (state.batches.length) {
      await autoPreview();
    }

  });

  /* ---------------------------
     SIZE CHANGE
  --------------------------- */
  sizeSelect?.addEventListener("change", async () => {

    if (customSize) {
      customSize.style.display =
        sizeSelect.value === "custom" &&
        modeSelect?.value !== "circle"
          ? "flex"
          : "none";
    }

    if (state.batches.length) {
      await autoPreview();
    }

  });

  /* ---------------------------
     LIVE AUTO PREVIEW
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

    el?.addEventListener("input", async () => {

      if (state.batches.length) {
        await autoPreview();
      }

    });

  });

});

/* =====================================
   DRAG SELECT MOVE
===================================== */
canvas?.addEventListener("mousedown", (e) => {

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

  state.selectedPlacement = null;

  for (const item of page) {

    if (item.isRectangle) {

      const x =
        item.x * PREVIEW_SCALE;

      const y =
        item.y * PREVIEW_SCALE;

      const w =
        item.boxW * PREVIEW_SCALE;

      const h =
        item.boxH * PREVIEW_SCALE;

      if (
        mx >= x &&
        mx <= x + w &&
        my >= y &&
        my <= y + h
      ) {
        state.selectedPlacement = item;
        break;
      }

    } else if (item.isCircle) {

      const r =
        item.diameterPx *
        PREVIEW_SCALE / 2;

      const cx =
        item.x *
        PREVIEW_SCALE + r;

      const cy =
        item.y *
        PREVIEW_SCALE + r;

      const dist =
        Math.hypot(
          mx - cx,
          my - cy
        );

      if (dist <= r) {
        state.selectedPlacement = item;
        break;
      }

    }

  }

  if (state.selectedPlacement) {

    state.isDragging = true;

    state.dragStart = {
      x: e.clientX,
      y: e.clientY,
      ox:
        state.selectedPlacement.offsetX || 0,
      oy:
        state.selectedPlacement.offsetY || 0
    };

  }

});

/* =====================================
   DRAG MOVE
===================================== */
canvas?.addEventListener("mousemove", async (e) => {

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

  showPageAtIndex(
    state.currentPageIndex
  );

});

/* =====================================
   END DRAG
===================================== */
canvas?.addEventListener("mouseup", () => {
  state.isDragging = false;
});

canvas?.addEventListener("mouseleave", () => {
  state.isDragging = false;
});

/* =====================================
   ZOOM WHEEL
===================================== */
canvas?.addEventListener("wheel", async (e) => {

  if (!state.selectedPlacement) return;

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

  showPageAtIndex(
    state.currentPageIndex
  );

}, { passive:false });

/* =====================================
   POPUP
===================================== */
function showPopup(msg = "Notifikasi") {

  const popup =
    document.getElementById(
      "popupNotif"
    );

  const text =
    document.getElementById(
      "popupText"
    );

  if (!popup || !text) return;

  text.textContent = msg;

  popup.classList.add("show");

  clearTimeout(window.popupTimer);

  window.popupTimer =
    setTimeout(() => {
      popup.classList.remove("show");
    }, 2200);

}

/* =====================================
   VALIDASI NAMA
===================================== */
function cekNamaPelanggan() {

  const nama =
    userName?.value.trim();

  if (!nama) {

    showPopup(
      "Nama pelanggan wajib diisi"
    );

    userName?.focus();

    return false;
  }

  return true;
}