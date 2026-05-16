
/* =====================================
   FILE: js/layout.js
   FINAL CLEAN CONTRACT VERSION
   CONSISTENT PLACEMENT SCHEMA
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
   FOOTER SAFE AREA PAGE 1
===================================== */
const FOOTER_HEIGHT = 220;

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

  let x = margin.left;
  let y = margin.top;

  let rowMaxH = 0;

  /* =================================
     PAGE BOTTOM LIMIT
  ================================= */
  function bottomLimit() {

    if (pageIndex === 0) {

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

  /* =================================
     NEXT PAGE
  ================================= */
  function nextPage() {

    pageIndex++;

    state.placementsByPage[
      pageIndex
    ] = [];

    x = margin.left;
    y = margin.top;

    rowMaxH = 0;

  }

  /* =================================
     LOOP ALL BATCHES
  ================================= */
  for (const batch of state.batches) {

    const mode =
      batch.mode || "normal";

    /* =============================
       MODE CIRCLE
    ============================= */
    if (mode === "circle") {

      const diameterCm =
        Math.max(
          1,
          num(
            batch.circleDiameter,
            4
          )
        );

      const diameter =
        diameterCm *
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

          if (!imgObj)
            continue;

          /* ======================
             PINDAH BARIS
          ====================== */
          if (
            x + diameter >
            fullW - margin.right
          ) {

            x = margin.left;

            y +=
              rowMaxH +
              gap;

            rowMaxH = 0;

          }
          

          /* ======================
             NEXT PAGE
          ====================== */
          if (
            y + diameter >
            bottomLimit()
          ) {

            nextPage();

          }

          /* ======================
             SAVE PLACEMENT
          ====================== */
          state.placementsByPage[
            pageIndex
          ].push({

            type: "circle",

            file,
            imgObj,

            x,
            y,

            diameter,

            offsetX: 0,
            offsetY: 0,

            scale: 1

          });

          rowMaxH =
            Math.max(
              rowMaxH,
              diameter
            );

          x +=
            diameter +
            gap;

        }

      }

    }

    /* =============================
       MODE RECTANGLE
    ============================= */
    else {

      let wcm;
      let hcm;

      /* =========================
         CUSTOM SIZE
      ========================= */
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

      }

      /* =========================
         PRESET SIZE
      ========================= */
      else {

        [wcm, hcm] =
          (
            batch.size ||
            "2x3"
          )
            .split("x")
            .map(Number);

      }

      const width =
        wcm *
        PX_PER_CM;

      const height =
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

          if (!imgObj)
            continue;

          /* ======================
             PINDAH BARIS
          ====================== */
          if (
            x + width >
            fullW - margin.right
          ) {

            x = margin.left;

            y +=
              rowMaxH +
              gap;

            rowMaxH = 0;

          }

          /* ======================
             NEXT PAGE
          ====================== */
          if (
            y + height >
            bottomLimit()
          ) {

            nextPage();

          }

          /* ======================
             SAVE PLACEMENT
          ====================== */
          state.placementsByPage[
            pageIndex
          ].push({

            type: "rectangle",

            file,
            imgObj,

            x,
            y,

            width,
            height,

            adjustable: true,

            offsetX: 0,
            offsetY: 0,

            scale: 1

          });

          rowMaxH =
            Math.max(
              rowMaxH,
              height
            );

          x +=
            width +
            gap;

        }

      }

    }

  }

}

