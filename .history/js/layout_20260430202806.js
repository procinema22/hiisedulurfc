/* =====================================
   FILE: js/layout.js
   FINAL FIX
   PREVIEW FULL PAGE
   FOOTER HANYA UNTUK PDF
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

/* footer tetap dipakai nanti di pdf.js */
export const FOOTER_HEIGHT = 220;

/* =====================================
   AUTO PREVIEW
===================================== */
export async function autoPreview() {

  await buildPlacementsForPages();

  await renderAllPages();

  showPageAtIndex(0);

}

/* =====================================
   BUILD LAYOUT
===================================== */
export async function buildPlacementsForPages() {

  state.placementsByPage = [[]];

  const fullW = 2480;
  const fullH = 3508;

  const margin =
    getMarginsPx();

  const gap =
    getGap();

  let pageIndex = 0;

  let x = margin.left;
  let y = margin.top;

  let rowMaxH = 0;

  /* =====================================
     PREVIEW SELALU FULL PAGE
     footer tidak reserve di canvas
  ===================================== */
  function bottomLimit() {

    return (
      fullH -
      margin.bottom
    );

  }

  /* =====================================
     NEXT PAGE
  ===================================== */
  function nextPage() {

    pageIndex++;

    state.placementsByPage[
      pageIndex
    ] = [];

    x = margin.left;
    y = margin.top;
    rowMaxH = 0;

  }

  /* =====================================
     PLACE ITEM
  ===================================== */
  function placeItem(
    data,
    w,
    h
  ) {

    /* pindah baris */
    if (
      x + w >
      fullW -
        margin.right
    ) {

      x = margin.left;

      y +=
        rowMaxH +
        gap;

      rowMaxH = 0;

    }

    /* pindah page */
    if (
      y + h >
      bottomLimit()
    ) {

      nextPage();

    }

    state.placementsByPage[
      pageIndex
    ].push(data);

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
      batch.mode ||
      "normal";

    const copies =
      Math.max(
        1,
        batch.copy || 1
      );

    /* =================================
       MODE CIRCLE
    ================================= */
    if (
      mode === "circle"
    ) {

      const dCm =
        Math.max(
          1,
          num(
            batch.circleDiameter,
            4
          )
        );

      const d =
        dCm *
        PX_PER_CM;

      for (
        let c = 0;
        c < copies;
        c++
      ) {

        for (const file of batch.files) {

          const imgObj =
            await loadImage(
              file
            );

          if (!imgObj)
            continue;

          placeItem(
            {
              file,
              imgObj,

              x,
              y,

              diameterPx:
                d,

              isCircle:
                true,

              offsetX: 0,
              offsetY: 0,
              scale: 1
            },
            d,
            d
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
        batch.size ===
        "custom"
      ) {

        wcm = num(
          batch.customW,
          2
        );

        hcm = num(
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
            await loadImage(
              file
            );

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

              isRectangle:
                true,

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