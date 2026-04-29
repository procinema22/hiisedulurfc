/* =====================================
   FILE: js/events.js
   FINAL PRO DRAG + ZOOM
   FIXED VERSION
===================================== */

let selectedItem = null;
let dragging = false;
let startX = 0;
let startY = 0;

/* ===============================
   PILIH FOTO
================================= */
canvas.addEventListener("mousedown", (e) => {

  if (!placementsByPage.length) return;

  const page =
    placementsByPage[currentPageIndex];

  if (!page || !page.length) return;

  const rect =
    canvas.getBoundingClientRect();

  const scaleX =
    canvas.width / rect.width;

  const scaleY =
    canvas.height / rect.height;

  const mx =
    (e.clientX - rect.left) *
    scaleX;

  const my =
    (e.clientY - rect.top) *
    scaleY;

  selectedItem = null;

  for (
    let i = page.length - 1;
    i >= 0;
    i--
  ) {

    const item = page[i];

    /* -------------------------
       RECTANGLE
    -------------------------- */
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
        selectedItem = item;
        break;
      }
    }

    /* -------------------------
       CIRCLE
    -------------------------- */
    if (item.isCircle) {

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

      const r = d / 2;

      const dist =
        Math.hypot(
          mx - cx,
          my - cy
        );

      if (dist <= r) {
        selectedItem = item;
        break;
      }
    }
  }

  if (selectedItem) {

    dragging = true;

    startX = e.clientX;
    startY = e.clientY;

    canvas.style.cursor =
      "grabbing";
  }

});

/* ===============================
   DRAG MOVE
================================= */
canvas.addEventListener(
  "mousemove",
  async (e) => {

    if (
      !dragging ||
      !selectedItem
    ) return;

    const dx =
      e.clientX - startX;

    const dy =
      e.clientY - startY;

    startX = e.clientX;
    startY = e.clientY;

    selectedItem.offsetX +=
      dx / PREVIEW_SCALE;

    selectedItem.offsetY +=
      dy / PREVIEW_SCALE;

    await renderAllPages();
    showPageAtIndex(
      currentPageIndex
    );

  }
);

/* ===============================
   LEPAS
================================= */
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

/* ===============================
   ZOOM
================================= */
canvas.addEventListener(
  "wheel",
  async (e) => {

    if (!selectedItem) return;

    e.preventDefault();

    const speed = 0.08;

    if (e.deltaY < 0) {
      selectedItem.zoom +=
        speed;
    } else {
      selectedItem.zoom -=
        speed;
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

/* ===============================
   DOUBLE CLICK RESET
================================= */
canvas.addEventListener(
  "dblclick",
  async () => {

    if (!selectedItem) return;

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