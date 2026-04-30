/* =========================================================
   FILE: js/layout.js  (FINAL)
   - Hide nama ON  = full kertas
   - Hide nama OFF = reserve footer page 1
   - Jika sentuh footer -> page berikutnya
   - Page 2+ full area
========================================================= */

import { PX_PER_CM, state } from "./state.js";
import { renderAllPages, showPageAtIndex } from "./render.js";
import {
  getMarginsPx,
  getGap,
  num,
  loadImage
} from "./helpers.js";

const FOOTER_HEIGHT = 220;

function isHideInfo() {
  return document.getElementById("hideInfo")?.checked || false;
}

export async function autoPreview() {
  await buildPlacementsForPages();
  await renderAllPages();
  showPageAtIndex(0);
}

export async function buildPlacementsForPages() {

  state.placementsByPage = [[]];

  const fullW = 2480;
  const fullH = 3508;

  const margin = getMarginsPx();
  const gap = getGap();

  let pageIndex = 0;
  let x = margin.left;
  let y = margin.top;
  let rowMaxH = 0;

  function getBottomLimit() {

    const hide = isHideInfo();

    if (pageIndex === 0 && !hide) {
      return fullH - margin.bottom - FOOTER_HEIGHT;
    }

    return fullH - margin.bottom;
  }

  function nextPage() {
    pageIndex++;
    state.placementsByPage[pageIndex] = [];
    x = margin.left;
    y = margin.top;
    rowMaxH = 0;
  }

  async function placeItem(data, w, h) {

    if (x + w > fullW - margin.right) {
      x = margin.left;
      y += rowMaxH + gap;
      rowMaxH = 0;
    }

    if (y + h > getBottomLimit()) {
      nextPage();
    }

    state.placementsByPage[pageIndex].push(data);

    rowMaxH = Math.max(rowMaxH, h);
    x += w + gap;
  }

  for (const batch of state.batches) {

    const mode = batch.mode || "normal";
    const copies = Math.max(1, batch.copy || 1);

    /* =======================
       MODE CIRCLE
    ======================= */
    if (mode === "circle") {

      const dCm = Math.max(
        1,
        num(batch.circleDiameter, 4)
      );

      const d = dCm * PX_PER_CM;

      for (let c = 0; c < copies; c++) {
        for (const file of batch.files) {

          const imgObj = await loadImage(file);
          if (!imgObj) continue;

          await placeItem({
            file,
            imgObj,
            x,
            y,
            diameterPx: d,
            isCircle: true,
            offsetX: 0,
            offsetY: 0,
            scale: 1
          }, d, d);

        }
      }

    }

    /* =======================
       MODE RECTANGLE
    ======================= */
    else {

      let wcm, hcm;

      if (batch.size === "custom") {
        wcm = num(batch.customW, 2);
        hcm = num(batch.customH, 3);
      } else {
        [wcm, hcm] =
          (batch.size || "2x3")
          .split("x")
          .map(Number);
      }

      const boxW = wcm * PX_PER_CM;
      const boxH = hcm * PX_PER_CM;

      for (let c = 0; c < copies; c++) {
        for (const file of batch.files) {

          const imgObj = await loadImage(file);
          if (!imgObj) continue;

          await placeItem({
            file,
            imgObj,
            x,
            y,
            boxW,
            boxH,
            isRectangle: true,
            offsetX: 0,
            offsetY: 0,
            scale: 1
          }, boxW, boxH);

        }
      }

    }

  }

}