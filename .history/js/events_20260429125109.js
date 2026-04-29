/* =====================================
   FILE: js/events.js
   FINAL FULL VERSION
   Preview + Buttons + PRO Drag Zoom
===================================== */

let selectedItem = null;
let dragging = false;
let startX = 0;
let startY = 0;

/* =====================================
   LOAD
===================================== */
window.addEventListener("load", () => {

  /* ---------------------------
     PREVIEW
  --------------------------- */
  previewBtn?.addEventListener(
    "click",
    async () => {

      if (!batches.length) {
        toast("Belum ada foto");
        return;
      }

      if (
        typeof cekNamaPelanggan ===
        "function"
      ) {
        if (
          !cekNamaPelanggan()
        ) return;
      }

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

      if (!batches.length) {
        toast("Belum ada foto");
        return;
      }

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

      if (!batches.length) {
        toast("Belum ada foto");
        return;
      }

      try {

        await openPdfFile();

      } catch (err) {

        console.error(err);

        toast(
          "PDF gagal"
        );
      }

    }
  );

  /* ---------------------------
     RESET
  --------------------------- */
  resetBtn?.addEventListener(
    "click",
    () => {

      resetState();

      clearCanvas();
      refreshBatchList();
      updatePricePreview();

      selectedItem = null;
      dragging = false;

      toast("Reset selesai");

    }
  );

  /* ---------------------------
     PAGE NAV
  --------------------------- */
  prevPageBtn?.addEventListener(
    "click",
    () => {
      showPageAtIndex(
        currentPageIndex - 1
      );
    }
  );

  nextPageBtn?.addEventListener(
    "click",
    () => {
      showPageAtIndex(
        currentPageIndex + 1
      );
    }
  );

  /* ---------------------------
     AUTO PREVIEW INPUT
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

    if (!el) return;

    el.addEventListener(
      "input",
      async () => {

        if (!batches.length)
          return;

        await autoPreview();

      }
    );

  });

});

/* =====================================
   PILIH FOTO
===================================== */
canvas.addEventListener(
  "mousedown",
  (e) => {

    if (
      !placementsByPage.length
    ) return;

    const page =
      placementsByPage[
        currentPageIndex
      ];

    if (!page) return;

    const rect =
      canvas.getBoundingClientRect();

    const mx =
      (e.clientX -
        rect.left) *
      (canvas.width /
        rect.width);

    const my =
      (e.clientY -
        rect.top) *
      (canvas.height /
        rect.height);

    selectedItem = null;

    for (
      let i =
        page.length - 1;
      i >= 0;
      i--
    ) {

      const item =
        page[i];

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
          selectedItem =
            item;
          break;
        }
      }

      if (
        item.isCircle
      ) {

        const d =
          item.diameterPx *
          PREVIEW_SCALE;

        const cx =
          item.x *
            PREVIEW_SCALE +
          d / 2;

        const cy =
          item.y *
            PREVIEW_SCALE +
          d / 2;

        const r =
          d / 2;

        const dist =
          Math.hypot(
            mx - cx,
            my - cy
          );

        if (
          dist <= r
        ) {
          selectedItem =
            item;
          break;
        }
      }

    }

    if (
      selectedItem
    ) {

      dragging = true;

      startX =
        e.clientX;

      startY =
        e.clientY;

      canvas.style.cursor =
        "grabbing";
    }

  }
);

/* =====================================
   DRAG
===================================== */
canvas.addEventListener(
  "mousemove",
  async (e) => {

    if (
      !dragging ||
      !selectedItem
    ) return;

    const dx =
      e.clientX -
      startX;

    const dy =
      e.clientY -
      startY;

    startX =
      e.clientX;

    startY =
      e.clientY;

    selectedItem.offsetX +=
      dx /
      PREVIEW_SCALE;

    selectedItem.offsetY +=
      dy /
      PREVIEW_SCALE;

    await renderAllPages();

    showPageAtIndex(
      currentPageIndex
    );

  }
);

/* =====================================
   STOP DRAG
===================================== */
function stopDrag() {

  dragging = false;

  canvas.style.cursor =
    "default";
}

canvas.addEventListener(
  "mouseup",
  stopDrag
);

canvas.addEventListener(
  "mouseleave",
  stopDrag
);

/* =====================================
   ZOOM
===================================== */
canvas.addEventListener(
  "wheel",
  async (e) => {

    if (
      !selectedItem
    ) return;

    e.preventDefault();

    if (
      e.deltaY < 0
    ) {
      selectedItem.zoom +=
        0.08;
    } else {
      selectedItem.zoom -=
        0.08;
    }

    selectedItem.zoom =
      Math.max(
        0.4,
        Math.min(
          4,
          selectedItem.zoom
        )
      );

    await renderAllPages();

    showPageAtIndex(
      currentPageIndex
    );

  },
  { passive: false }
);

/* =====================================
   RESET FOTO
===================================== */
canvas.addEventListener(
  "dblclick",
  async () => {

    if (
      !selectedItem
    ) return;

    selectedItem.offsetX = 0;
    selectedItem.offsetY = 0;
    selectedItem.zoom = 1;

    await renderAllPages();

    showPageAtIndex(
      currentPageIndex
    );

    if (
      typeof showPopup ===
      "function"
    ) {
      showPopup(
        "Foto direset"
      );
    }

  }
);