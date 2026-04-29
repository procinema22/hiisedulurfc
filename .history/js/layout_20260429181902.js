/* =====================================
   FILE: js/layout.js
   FINAL PRO VERSION
   Multi Page Layout + Drag Ready
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

  const margin =
    getMarginsPx();

  const gap =
    getGap();

  let pageIndex = 0;

  let x =
    margin.left;

  let y =
    margin.top;

  let rowMaxH = 0;

  function bottomLimit() {
    return (
      fullH -
      margin.bottom
    );
  }

  /* =========================
     LOOP BATCHES
  ========================= */
  for (const batch of state.batches) {

    const mode =
      batch.mode || "normal";

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

      if (
        batch.size ===
        "custom"
      ) {
        dCm =
          num(
            batch.customW,
            4
          );
      }

      const diameterPx =
        dCm *
        PX_PER_CM;

      const copies =
        Math.max(
          1,
          batch.copy || 1
        );

      for (
        let c = 0;
        c < copies;
        c++
      ) {

        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj) continue;

          /* pindah baris */
          if (
            x + diameterPx >
            fullW -
              margin.right
          ) {
            x =
              margin.left;

            y +=
              rowMaxH +
              gap;

            rowMaxH = 0;
          }

          /* pindah halaman */
          if (
            y + diameterPx >
            bottomLimit()
          ) {
            pageIndex++;

            state
              .placementsByPage[
              pageIndex
            ] = [];

            x =
              margin.left;

            y =
              margin.top;

            rowMaxH = 0;
          }

          /* push item */
          state
            .placementsByPage[
            pageIndex
          ].push({

            file,
            imgObj,

            x,
            y,

            diameterPx,

            isCircle: true,

            offsetX: 0,
            offsetY: 0,

            scale: 1

          });

          rowMaxH =
            Math.max(
              rowMaxH,
              diameterPx
            );

          x +=
            diameterPx +
            gap;

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

      const copies =
        Math.max(
          1,
          batch.copy || 1
        );

      for (
        let c = 0;
        c < copies;
        c++
      ) {

        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj) continue;

          /* pindah baris */
          if (
            x + boxW >
            fullW -
              margin.right
          ) {

            x =
              margin.left;

            y +=
              rowMaxH +
              gap;

            rowMaxH = 0;
          }

          /* pindah halaman */
          if (
            y + boxH >
            bottomLimit()
          ) {

            pageIndex++;

            state
              .placementsByPage[
              pageIndex
            ] = [];

            x =
              margin.left;

            y =
              margin.top;

            rowMaxH = 0;
          }

          /* push item */
          state
            .placementsByPage[
            pageIndex
          ].push({

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

          });

          rowMaxH =
            Math.max(
              rowMaxH,
              boxH
            );

          x +=
            boxW +
            gap;

        }

      }

    }

  }

}