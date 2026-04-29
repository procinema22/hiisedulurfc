/* =====================================
   FILE: js/render.js
   Preview Canvas / Multi Page
===================================== */

/* ---------------------------
   Draw Rectangle Cover
--------------------------- */
function drawImageCover(
  ctxLocal,
  img,
  x,
  y,
  boxW,
  boxH
) {
  const iw = img.width;
  const ih = img.height;

  const scale =
    Math.max(
      boxW / iw,
      boxH / ih
    );

  const drawW = iw * scale;
  const drawH = ih * scale;

  const dx =
    x + (boxW - drawW) / 2;

  const dy =
    y + (boxH - drawH) / 2;

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

  ctxLocal.strokeStyle = "#000";
  ctxLocal.lineWidth = 2;
  ctxLocal.strokeRect(
    x,
    y,
    boxW,
    boxH
  );
}

/* ---------------------------
   Draw Circle
--------------------------- */
function drawCircle(
  ctxLocal,
  img,
  x,
  y,
  diameter
) {
  const r = diameter / 2;
  const cx = x + r;
  const cy = y + r;

  const iw = img.width;
  const ih = img.height;

  const scale =
    Math.max(
      diameter / iw,
      diameter / ih
    );

  const drawW = iw * scale;
  const drawH = ih * scale;

  const dx = cx - drawW / 2;
  const dy = cy - drawH / 2;

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

/* ---------------------------
   Render Semua Halaman
--------------------------- */
async function renderAllPages() {

  pagesCache = [];

  const fullW = 2480;
  const fullH = 3508;

  for (const page of placementsByPage) {

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
            PREVIEW_SCALE
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
            PREVIEW_SCALE
        );
      }
    }

    pagesCache.push(pc);
  }
}

/* ---------------------------
   Show Halaman
--------------------------- */
function showPageAtIndex(i) {

  if (!pagesCache.length) {
    clearCanvas();
    return;
  }

  currentPageIndex =
    clamp(
      i,
      0,
      pagesCache.length - 1
    );

  const page =
    pagesCache[
      currentPageIndex
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

/* ---------------------------
   Update Nav
--------------------------- */
function updatePageNav() {

  if (!pageNav) return;

  pageNav.style.display =
    pagesCache.length > 1
      ? "flex"
      : "none";

  if (pageIndicator) {
    pageIndicator.textContent =
      `Halaman ${
        currentPageIndex + 1
      } / ${
        pagesCache.length
      }`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled =
      currentPageIndex === 0;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled =
      currentPageIndex ===
      pagesCache.length - 1;
  }
}