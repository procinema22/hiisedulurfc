/* =====================================
   FILE: js/layout.js
   FINAL FULL VERSION
   - Footer aman page 1
   - Hide nama ON = full kertas
   - Jika sentuh footer pindah page berikutnya
   - Support normal / circle / custom
===================================== */

import {
  PX_PER_CM,
  state
} from "./state.js";

import {
  renderAllPages,
  showPageAtIndex
} from "./render.js";

import {
  getMarginsPx,
  getGap,
  num,
  loadImage
} from "./helpers.js";

/* tinggi area footer */
const FOOTER_HEIGHT = 220;

/* =====================================
   CEK MODE SEMBUNYIKAN NAMA
===================================== */
function isHideInfo() {
  return document.getElementById("hideInfo")?.checked || false;
}

/* =====================================
   AUTO PREVIEW
===================================== */
export async function autoPreview() {

  await buildPlacementsForPages();

  await renderAllPages();

  showPageAtIndex(0);

}

/* =====================================
   BUILD ALL PAGE LAYOUT
===================================== */
export async function buildPlacementsForPages() {

  state.placementsByPage = [];
  state.placementsByPage[0] = [];

  const fullW = 2480;
  const fullH = 3508;

  const margin = getMarginsPx();
  const gap = getGap();

  let pageIndex = 0;

  let x = margin.left;
  let y = margin.top;

  let rowMaxH = 0;

  /* =====================================
     BATAS BAWAH PAGE
     page 1 + footer jika nama tampil
  ===================================== */
  function bottomLimit() {

    const hideInfo = isHideInfo();

    if (pageIndex === 0 && !hideInfo) {
      return (
        fullH -
        margin.bottom -
        FOOTER_HEIGHT
      );
    }

    return (
      fullH -
      margin.bottom
    );

  }

  /* =====================================
     PAGE BARU
  ===================================== */
  function nextPage() {

    pageIndex++;

    state.placementsByPage[pageIndex] = [];

    x = margin.left;
    y = margin.top;
    rowMaxH = 0;

  }

  /* =====================================
     PLACE ITEM GENERIC
  ===================================== */
  function placeItem(data, w, h) {

    /* pindah baris */
    if (
      x + w >
      fullW - margin.right
    ) {

      x = margin.left;

      y += rowMaxH + gap;

      rowMaxH = 0;

    }

    /* kalau sentuh footer / bawah */
    if (
      y + h >
      bottomLimit()
    ) {

      nextPage();

    }

    state.placementsByPage[pageIndex].push(data);

    rowMaxH =
      Math.max(
        rowMaxH,
        h
      );

    x += w + gap;

  }

  /* =====================================
     LOOP BATCH
  ===================================== */
  for (const batch of state.batches) {

    const mode =
      batch.mode || "normal";

    const copies =
      Math.max(
        1,
        batch.copy || 1
      );

    /* =================================
       MODE CIRCLE
    ================================= */
    if (mode === "circle") {

      let dCm =
        Math.max(
          1,
          num(
            batch.circleDiameter,
            4
          )
        );

      const diameterPx =
        dCm *
        PX_PER_CM;

      for (
        let c = 0;
        c < copies;
        c++
      ) {

        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj)
            continue;

          placeItem(
            {
              file,
              imgObj,

              x,
              y,

              diameterPx,

              isCircle: true,

              offsetX: 0,
              offsetY: 0,

              scale: 1
            },
            diameterPx,
            diameterPx
          );

        }

      }

    }

    /* =================================
       MODE RECTANGLE
    ================================= */
    else {

      let wcm, hcm;

      if (
        batch.size === "custom"
      ) {

        wcm =
          num(
            batch.customW,
            2
          );

        hcm =
          num(
            batch.customH,
            3
          );

      } else {

        [wcm, hcm] =
          (
            batch.size ||
            "2x3"
          )
            .split("x")
            .map(Number);

      }

      const boxW =
        wcm *
        PX_PER_CM;

      const boxH =
        hcm *
        PX_PER_CM;

      for (
        let c = 0;
        c < copies;
        c++
      ) {

        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj)
            continue;

          placeItem(
            {
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
            },
            boxW,
            boxH
          );

        }

      }

    }

  }

}