/* =====================================
   FILE: js/render.js
   FINAL MODULE VERSION
   Preview Canvas / Multi Page
===================================== */

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

/* =====================================
   DRAW RECTANGLE COVER
===================================== */
export function drawImageCover(
  ctxLocal,
  img,
  x,
  y,
  boxW,
  boxH,
  offsetX = 0,
  offsetY = 0,
  scaleZoom = 1
) {

  const iw =
    img.width;

  const ih =
    img.height;

  const baseScale =
    Math.max(
      boxW / iw,
      boxH / ih
    );

  const scale =
    baseScale *
    scaleZoom;

  const drawW =
    iw * scale;

  const drawH =
    ih * scale;

  const dx =
    x +
    (boxW - drawW) / 2 +
    offsetX;

  const dy =
    y +
    (boxH - drawH) / 2 +
    offsetY;

  ctxLocal.save();

  ctxLocal.beginPath();
  ctxLocal.rect(
    x,
    y,
    boxW,
    boxH
  );

  ctxLocal.clip();

  ctxLocal.drawImage(
    img,
    dx,
    dy,
    drawW,
    drawH
  );

  ctxLocal.restore();

  ctxLocal.strokeStyle =
    "#000";

  ctxLocal.lineWidth = 2;

  ctxLocal.strokeRect(
    x,
    y,
    boxW,
    boxH
  );

}

/* =====================================
   DRAW CIRCLE
===================================== */
export function drawCircle(
  ctxLocal,
  img,
  x,
  y,
  diameter,
  offsetX = 0,
  offsetY = 0,
  scaleZoom = 1
) {

  const r =
    diameter / 2;

  const cx =
    x + r;

  const cy =
    y + r;

  const iw =
    img.width;

  const ih =
    img.height;

  const baseScale =
    Math.max(
      diameter / iw,
      diameter / ih
    );

  const scale =
    baseScale *
    scaleZoom;

  const drawW =
    iw * scale;

  const drawH =
    ih * scale;

  const dx =
    cx -
    drawW / 2 +
    offsetX;

  const dy =
    cy -
    drawH / 2 +
    offsetY;

  ctxLocal.save();

  ctxLocal.beginPath();

  ctxLocal.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctxLocal.clip();

  ctxLocal.drawImage(
    img,
    dx,
    dy,
    drawW,
    drawH
  );

  ctxLocal.restore();

  ctxLocal.beginPath();

  ctxLocal.arc(
    cx,
    cy,
    r,
    0,
    Math.PI * 2
  );

  ctxLocal.lineWidth = 2;
  ctxLocal.strokeStyle = "#000";
  ctxLocal.stroke();

}

/* =====================================
   RENDER ALL PAGES
===================================== */
export async function renderAllPages() {

  state.pagesCache = [];

  const fullW = 2480;
  const fullH = 3508;

  for (const page of state.placementsByPage) {

    const pc =
      document.createElement(
        "canvas"
      );

    pc.width =
      fullW *
      PREVIEW_SCALE;

    pc.height =
      fullH *
      PREVIEW_SCALE;

    const pctx =
      pc.getContext("2d");

    pctx.fillStyle =
      "#ffffff";

    pctx.fillRect(
      0,
      0,
      pc.width,
      pc.height
    );

    for (const item of page) {

      if (item.isRectangle) {

        drawImageCover(
          pctx,
          item.imgObj,
          item.x *
            PREVIEW_SCALE,
          item.y *
            PREVIEW_SCALE,
          item.boxW *
            PREVIEW_SCALE,
          item.boxH *
            PREVIEW_SCALE,
          (item.offsetX || 0) *
            PREVIEW_SCALE,
          (item.offsetY || 0) *
            PREVIEW_SCALE,
          item.scale || 1
        );

      }

      else if (item.isCircle) {

        drawCircle(
          pctx,
          item.imgObj,
          item.x *
            PREVIEW_SCALE,
          item.y *
            PREVIEW_SCALE,
          item.diameterPx *
            PREVIEW_SCALE,
          (item.offsetX || 0) *
            PREVIEW_SCALE,
          (item.offsetY || 0) *
            PREVIEW_SCALE,
          item.scale || 1
        );

      }

    }

    state.pagesCache.push(
      pc
    );

  }

}

/* =====================================
   SHOW PAGE
===================================== */
export function showPageAtIndex(i) {

  if (
    !state.pagesCache.length
  ) {

    clearCanvas();
    return;

  }

  state.currentPageIndex =
    clamp(
      i,
      0,
      state.pagesCache.length - 1
    );

  const page =
    state.pagesCache[
      state.currentPageIndex
    ];

  clearCanvas();

  ctx.drawImage(
    page,
    0,
    0,
    canvas.width,
    canvas.height
  );

  updatePageNav();

}

/* =====================================
   UPDATE NAVIGATION
===================================== */
export function updatePageNav() {

  if (!pageNav) return;

  pageNav.style.display =
    state.pagesCache.length > 1
      ? "flex"
      : "none";

  if (pageIndicator) {

    pageIndicator.textContent =
      `Halaman ${
        state.currentPageIndex + 1
      } / ${
        state.pagesCache.length
      }`;

  }

  if (prevPageBtn) {

    prevPageBtn.disabled =
      state.currentPageIndex === 0;

  }

  if (nextPageBtn) {

    nextPageBtn.disabled =
      state.currentPageIndex ===
      state.pagesCache.length - 1;

  }

}