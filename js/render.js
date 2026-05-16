/* =====================================
   FILE: js/render.js
   FINAL CLEAN CONTRACT VERSION
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
   CONFIG
===================================== */
const FULL_W = 2480;
const FULL_H = 3508;

export const FOOTER_HEIGHT = 220;

/* =====================================
   CEK HIDE INFO
===================================== */
function isHideInfo() {

  return (
    document.getElementById(
      "hideInfo"
    )?.checked || false
  );

}

/* =====================================
   DRAW RECTANGLE COVER
===================================== */
export function drawImageCover(

  ctxLocal,
  img,

  x,
  y,

  width,
  height,

  offsetX = 0,
  offsetY = 0,

  scaleZoom = 1,

  rotateLandscapeToPortrait = true

) {

  let iw = img.width;
  let ih = img.height;

  let rotate = false;

  if (
    rotateLandscapeToPortrait &&
    iw > ih
  ) {

    rotate = true;

    [iw, ih] = [ih, iw];

  }

  const baseScale =
    Math.max(
      width / iw,
      height / ih
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
    (width - drawW) / 2 +
    offsetX;

  const dy =
    y +
    (height - drawH) / 2 +
    offsetY;

  ctxLocal.save();

  ctxLocal.beginPath();

  ctxLocal.rect(
    x,
    y,
    width,
    height
  );

  ctxLocal.clip();

  if (rotate) {

    ctxLocal.save();

    ctxLocal.translate(
      dx + drawW / 2,
      dy + drawH / 2
    );

    ctxLocal.rotate(
      Math.PI / 2
    );

    ctxLocal.drawImage(
      img,
      -drawH / 2,
      -drawW / 2,
      drawH,
      drawW
    );

    ctxLocal.restore();

  } else {

    ctxLocal.drawImage(
      img,
      dx,
      dy,
      drawW,
      drawH
    );

  }

  ctxLocal.restore();

  ctxLocal.strokeStyle =
    "#000";

  ctxLocal.lineWidth = 2;

  ctxLocal.strokeRect(
    x,
    y,
    width,
    height
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
    cx - drawW / 2 +
    offsetX;

  const dy =
    cy - drawH / 2 +
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

  ctxLocal.strokeStyle =
    "#000";

  ctxLocal.stroke();

}

/* =====================================
   DRAW FOOTER
===================================== */
function drawFooter() {

  return;

}

/* =====================================
   RENDER ALL PAGES
===================================== */
export async function renderAllPages() {

  state.pagesCache = [];

  const hideInfo =
    isHideInfo();

  const enableMargin =
    document.getElementById(
      "enableMargin"
    );

  const customTextInput =
    document.getElementById(
      "customTextInput"
    );

    const marginTopInput =
    document.getElementById(
      "marginTop"
    );
  
  const marginTop =
    parseInt(
      marginTopInput?.value || 10
    );
  
  const extraTop =
    enableMargin?.checked
      ? marginTop * 8
      : 0;

  for (
    let i = 0;
    i <
    state.placementsByPage
      .length;
    i++
  ) {

    const page =
      state
        .placementsByPage[i];

    const pc =
      document.createElement(
        "canvas"
      );

    pc.width =
      FULL_W *
      PREVIEW_SCALE;

    pc.height =
      FULL_H *
      PREVIEW_SCALE;

    const pctx =
      pc.getContext("2d");

    pctx.fillStyle =
      "#fff";

    pctx.fillRect(
      0,
      0,
      pc.width,
      pc.height
    );

    /* =========================
   CUSTOM TITLE
========================= */
if (enableMargin?.checked) {

  const title =
    customTextInput?.value?.trim();

  if (title) {

    pctx.save();

    const fontSizeInput =
  document.getElementById(
    "fontSizeInput"
  );

const fontSize =
  parseInt(
    fontSizeInput?.value || 38
  );

pctx.font =
  `bold ${
    fontSize * PREVIEW_SCALE
  }px "Times New Roman"`;

    pctx.fillStyle =
      "#000";

    pctx.textAlign =
      "center";

    pctx.fillText(
      title,
      pc.width / 2,
      (extraTop * PREVIEW_SCALE)
    );

    pctx.restore();

  }

}

    /* =========================
       RENDER ITEMS
    ========================= */
    for (const item of page) {

      if (
        item.type ===
        "rectangle"
      ) {

        drawImageCover(

          pctx,

          item.imgObj,

          item.x *
            PREVIEW_SCALE,

            (item.y + extraTop + 60) *
            PREVIEW_SCALE,

          item.width *
            PREVIEW_SCALE,

          item.height *
            PREVIEW_SCALE,

          item.offsetX *
            PREVIEW_SCALE,

          item.offsetY *
            PREVIEW_SCALE,

          item.scale

        );

      }

      else if (
        item.type ===
        "circle"
      ) {

        drawCircle(

          pctx,

          item.imgObj,

          item.x *
            PREVIEW_SCALE,

          (item.y + extraTop) *
            PREVIEW_SCALE,

          item.diameter *
            PREVIEW_SCALE,

          item.offsetX *
            PREVIEW_SCALE,

          item.offsetY *
            PREVIEW_SCALE,

          item.scale

        );

      }

    }

    if (
      i === 0 &&
      !hideInfo
    ) {

      drawFooter(
        pctx
      );

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
   PAGE NAV
===================================== */
export function updatePageNav() {

  if (!pageNav)
    return;

  pageNav.style.display =
    state.pagesCache.length >
    1
      ? "flex"
      : "none";

  pageIndicator.textContent =
    `Halaman ${
      state.currentPageIndex +
      1
    } / ${
      state.pagesCache.length
    }`;

  prevPageBtn.disabled =
    state.currentPageIndex ===
    0;

  nextPageBtn.disabled =
    state.currentPageIndex ===
    state.pagesCache.length -
      1;

}