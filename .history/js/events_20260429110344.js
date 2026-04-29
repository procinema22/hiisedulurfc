/* =====================================
   MODE PRO DRAG + ZOOM
   Tambahkan di js/events.js
===================================== */

let selectedItem = null;
let dragging = false;

/* ===============================
   PILIH FOTO
================================= */
canvas.addEventListener("mousedown", (e) => {

  const rect =
    canvas.getBoundingClientRect();

  const mx =
    (e.clientX - rect.left) *
    (canvas.width / rect.width);

  const my =
    (e.clientY - rect.top) *
    (canvas.height / rect.height);

  const page =
    placementsByPage[currentPageIndex];

  selectedItem = null;

  for (let i = page.length - 1; i >= 0; i--) {

    const item = page[i];

    /* rectangle */
    if (item.isRectangle) {

      const x =
        item.x * PREVIEW_SCALE;

      const y =
        item.y * PREVIEW_SCALE;

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

    /* circle */
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
    canvas.style.cursor =
      "grabbing";
  }

});

/* ===============================
   LEPAS DRAG
================================= */
canvas.addEventListener("mouseup", () => {
  dragging = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener(
  "mouseleave",
  () => {
    dragging = false;
    canvas.style.cursor =
      "default";
  }
);

/* ===============================
   GESER FOTO
================================= */
canvas.addEventListener(
  "mousemove",
  async (e) => {

    if (
      !dragging ||
      !selectedItem
    ) return;

    selectedItem.offsetX +=
      e.movementX /
      PREVIEW_SCALE;

    selectedItem.offsetY +=
      e.movementY /
      PREVIEW_SCALE;

    await renderAllPages();
    showPageAtIndex(
      currentPageIndex
    );

  }
);

/* ===============================
   ZOOM FOTO
================================= */
canvas.addEventListener(
  "wheel",
  async (e) => {

    if (!selectedItem) return;

    e.preventDefault();

    selectedItem.zoom +=
      e.deltaY < 0
        ? 0.05
        : -0.05;

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

    showPopup(
      "Posisi foto direset"
    );

  }
);