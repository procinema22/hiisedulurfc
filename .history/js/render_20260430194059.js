/* =========================================================
   FILE: js/render.js (FINAL)
   - Preview bersih (tanpa footer)
   - Footer hanya jika hide nama OFF
   - Jika ingin footer hanya PDF nanti pindah ke pdf.js
========================================================= */

import {
  canvas,
  ctx,
  pageNav,
  prevPageBtn,
  nextPageBtn,
  pageIndicator,
  PREVIEW_SCALE,
  state
} from "./state.js";

import {
  clearCanvas,
  clamp
} from "./helpers.js";

const FULL_W = 2480;
const FULL_H = 3508;
export const FOOTER_HEIGHT = 220;

function isHideInfo() {
  return document.getElementById("hideInfo")?.checked || false;
}

/* =======================
   DRAW RECTANGLE
======================= */
export function drawImageCover(
  c, img, x, y, w, h,
  ox = 0, oy = 0, zoom = 1
) {

  const scale =
    Math.max(w / img.width, h / img.height) * zoom;

  const dw = img.width * scale;
  const dh = img.height * scale;

  const dx = x + (w - dw) / 2 + ox;
  const dy = y + (h - dh) / 2 + oy;

  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.drawImage(img, dx, dy, dw, dh);
  c.restore();

  c.strokeStyle = "#111";
  c.lineWidth = 2;
  c.strokeRect(x, y, w, h);
}

/* =======================
   DRAW CIRCLE
======================= */
export function drawCircle(
  c, img, x, y, d,
  ox = 0, oy = 0, zoom = 1
) {

  const r = d / 2;
  const cx = x + r;
  const cy = y + r;

  const scale =
    Math.max(d / img.width, d / img.height) * zoom;

  const dw = img.width * scale;
  const dh = img.height * scale;

  const dx = cx - dw / 2 + ox;
  const dy = cy - dh / 2 + oy;

  c.save();
  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.clip();
  c.drawImage(img, dx, dy, dw, dh);
  c.restore();

  c.beginPath();
  c.arc(cx, cy, r, 0, Math.PI * 2);
  c.strokeStyle = "#111";
  c.lineWidth = 2;
  c.stroke();
}

/* =======================
   FOOTER (optional preview)
======================= */
function drawFooter(c) {

  const y =
    (FULL_H - FOOTER_HEIGHT) *
    PREVIEW_SCALE;

  c.beginPath();
  c.moveTo(40, y);
  c.lineTo(
    FULL_W * PREVIEW_SCALE - 40,
    y
  );
  c.strokeStyle = "#111";
  c.lineWidth = 2;
  c.stroke();

  c.font = "bold 18px Arial";
  c.fillStyle = "#111";

  c.fillText("NAMA PEMESAN", 40, y + 35);

  c.fillText(
    "HARGA",
    FULL_W * PREVIEW_SCALE - 220,
    y + 35
  );
}

/* =======================
   RENDER
======================= */
export async function renderAllPages() {

  state.pagesCache = [];

  for (let i = 0; i < state.placementsByPage.length; i++) {

    const page = state.placementsByPage[i];

    const pc = document.createElement("canvas");
    pc.width = FULL_W * PREVIEW_SCALE;
    pc.height = FULL_H * PREVIEW_SCALE;

    const c = pc.getContext("2d");

    c.fillStyle = "#fff";
    c.fillRect(0, 0, pc.width, pc.height);

    for (const item of page) {

      if (item.isRectangle) {

        drawImageCover(
          c,
          item.imgObj,
          item.x * PREVIEW_SCALE,
          item.y * PREVIEW_SCALE,
          item.boxW * PREVIEW_SCALE,
          item.boxH * PREVIEW_SCALE,
          (item.offsetX || 0) * PREVIEW_SCALE,
          (item.offsetY || 0) * PREVIEW_SCALE,
          item.scale || 1
        );

      } else if (item.isCircle) {

        drawCircle(
          c,
          item.imgObj,
          item.x * PREVIEW_SCALE,
          item.y * PREVIEW_SCALE,
          item.diameterPx * PREVIEW_SCALE,
          (item.offsetX || 0) * PREVIEW_SCALE,
          (item.offsetY || 0) * PREVIEW_SCALE,
          item.scale || 1
        );

      }

    }

    /* kalau mau preview tanpa footer:
       hapus blok ini */
    if (i === 0 && !isHideInfo()) {
      drawFooter(c);
    }

    state.pagesCache.push(pc);

  }

}

/* =======================
   SHOW PAGE
======================= */
export function showPageAtIndex(i) {

  if (!state.pagesCache.length) {
    clearCanvas();
    return;
  }

  state.currentPageIndex =
    clamp(i, 0, state.pagesCache.length - 1);

  clearCanvas();

  ctx.drawImage(
    state.pagesCache[state.currentPageIndex],
    0, 0,
    canvas.width,
    canvas.height
  );

  updatePageNav();
}

/* =======================
   NAV
======================= */
export function updatePageNav() {

  if (!pageNav) return;

  pageNav.style.display =
    state.pagesCache.length > 1
      ? "flex"
      : "none";

  pageIndicator.textContent =
    `Halaman ${state.currentPageIndex + 1} / ${state.pagesCache.length}`;

  prevPageBtn.disabled =
    state.currentPageIndex === 0;

  nextPageBtn.disabled =
    state.currentPageIndex ===
    state.pagesCache.length - 1;
}