/* =====================================
   FILE: js/layout.js
   FINAL WITH DRAG + ZOOM DATA
===================================== */

/* ---------------------------
   Auto Preview
--------------------------- */
async function autoPreview() {
  await buildPlacementsForPages();
  await renderAllPages();
  showPageAtIndex(0);
}

/* ---------------------------
   Build Layout Semua Halaman
--------------------------- */
async function buildPlacementsForPages() {

  placementsByPage = [];
  placementsByPage[0] = [];

  const fullW = 2480;
  const fullH = 3508;

  const margin = getMarginsPx();
  const gap = getGap();

  let pageIndex = 0;

  let x = margin.left;
  let y = margin.top;

  let rowMaxH = 0;

  function getBottomLimit() {
    return fullH - margin.bottom;
  }

  for (const batch of batches) {

    const mode = batch.mode || "normal";

    /* =========================
       MODE CIRCLE
    ========================= */
    if (mode === "circle") {

      let dCm =
        Math.max(
          1,
          num(batch.circleDiameter, 4)
        );

      if (batch.size === "custom") {
        dCm = num(batch.customW, 4);
      }

      dCm = Math.max(1, dCm);

      const diameter =
        dCm * PX_PER_CM;

      const copies =
        Math.max(1, batch.copy || 1);

      for (let c = 0; c < copies; c++) {
        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj) continue;

          if (
            x + diameter >
            fullW - margin.right
          ) {
            x = margin.left;
            y += rowMaxH + gap;
            rowMaxH = 0;
          }

          if (
            y + diameter >
            getBottomLimit()
          ) {
            pageIndex++;
            placementsByPage[pageIndex] = [];

            x = margin.left;
            y = margin.top;
            rowMaxH = 0;
          }

          placementsByPage[pageIndex].push({

            file,
            imgObj,

            x,
            y,

            diameterPx: diameter,
            isCircle: true,

            offsetX: 0,
            offsetY: 0,
            zoom: 1

          });

          rowMaxH =
            Math.max(rowMaxH, diameter);

          x += diameter + gap;
        }
      }
    }

    /* =========================
       MODE RECTANGLE
    ========================= */
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

      const boxW =
        wcm * PX_PER_CM;

      const boxH =
        hcm * PX_PER_CM;

      const copies =
        Math.max(1, batch.copy || 1);

      for (let c = 0; c < copies; c++) {
        for (const file of batch.files) {

          const imgObj =
            await loadImage(file);

          if (!imgObj) continue;

          if (
            x + boxW >
            fullW - margin.right
          ) {
            x = margin.left;
            y += rowMaxH + gap;
            rowMaxH = 0;
          }

          if (
            y + boxH >
            getBottomLimit()
          ) {
            pageIndex++;
            placementsByPage[pageIndex] = [];

            x = margin.left;
            y = margin.top;
            rowMaxH = 0;
          }

          placementsByPage[pageIndex].push({

            file,
            imgObj,

            x,
            y,

            boxW,
            boxH,

            isRectangle: true,

            offsetX: 0,
            offsetY: 0,
            zoom: 1

          });

          rowMaxH =
            Math.max(rowMaxH, boxH);

          x += boxW + gap;
        }
      }
    }
  }
}