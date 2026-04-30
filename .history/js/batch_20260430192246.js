/* =====================================
   FILE: js/batch.js
   FINAL MULTI PAGE NO DISKON
   Harga dihitung per lembar
===================================== */

import {
  batchList,
  manualHargaInput,
  manualHargaCheckbox,
  priceDisplay,
  state,
  resetState,
  sizeSelect
} from "./state.js";

import {
  formatRupiah,
  toast,
  clearCanvas
} from "./helpers.js";

import {
  autoPreview
} from "./layout.js";

/* =====================================
   REFRESH BATCH LIST
===================================== */
export function refreshBatchList() {

  if (!batchList) return;

  batchList.innerHTML = "";

  state.batches.forEach((batch, index) => {

    const row =
      document.createElement("div");

    row.className =
      "batch-row";

    const sizeText =
      batch.size === "custom"
        ? `${batch.customW} x ${batch.customH}`
        : (batch.size || "2x3")
            .replace("x", " x ");

    row.innerHTML = `
      <div style="flex:1">
        <strong>Batch ${index + 1}</strong>
        <div class="small">
          ${(batch.files || []).length} foto
          — ${sizeText}
          — mode: ${batch.mode}
        </div>
      </div>
    `;

    const copyInput =
      document.createElement("input");

    copyInput.type = "number";
    copyInput.min = "1";
    copyInput.value =
      batch.copy || 1;

    copyInput.style.width =
      "60px";

    copyInput.addEventListener(
      "change",
      async () => {

        batch.copy =
          Math.max(
            1,
            parseInt(
              copyInput.value
            ) || 1
          );

        await autoPreview();
        updatePricePreview();

      }
    );

    const delBtn =
      document.createElement("button");

    delBtn.type = "button";
    delBtn.className = "warn";
    delBtn.textContent = "❌";

    delBtn.addEventListener(
      "click",
      async () => {

        state.batches.splice(
          index,
          1
        );

        refreshBatchList();

        if (!state.batches.length) {

          clearCanvas();
          resetState();

        } else {

          await autoPreview();

        }

        updatePricePreview();

        toast("Batch dihapus");

      }
    );

    row.appendChild(copyInput);
    row.appendChild(delBtn);
    batchList.appendChild(row);

  });

  batchList.style.display =
    state.batches.length
      ? "block"
      : "none";

}

/* =====================================
   HARGA PER PAGE
===================================== */
function hitungHargaPage(page) {

  if (!page?.length)
    return 0;

  let bottomY = 0;
  let circleOnly = true;
  let circleCount = 0;

  page.forEach(item => {

    let h = 0;

    if (item.isCircle) {

      h =
        item.diameterPx || 0;

      circleCount++;

    } else {

      h =
        item.boxH || 0;

      circleOnly = false;

    }

    const y2 =
      item.y + h;

    if (y2 > bottomY)
      bottomY = y2;

  });

  /* =========================
     PURE CIRCLE MODE
  ========================= */
  if (circleOnly) {

    if (circleCount <= 3)
      return 1000;

    if (circleCount <= 6)
      return 1500;

    if (circleCount <= 9)
      return 2000;

    return 2500;
  }

  /* =========================
     ZONA VERTIKAL
  ========================= */
  const printableHeight =
    3508;

  const persen =
    bottomY /
    printableHeight;

  if (persen <= 0.25)
    return 500;

  if (persen <= 0.45)
    return 1000;

  if (persen <= 0.65)
    return 1500;

  return 2000;

}

/* =====================================
   TOTAL AUTO PRICE
===================================== */
function hitungHargaAI() {

  const pages =
    state.placementsByPage ||
    [];

  if (!pages.length) {

    const adaFoto =
      state.batches.some(
        b =>
          (b.files?.length || 0) > 0
      );

    return adaFoto ? 500 : 0;
  }

  let total = 0;

  pages.forEach(page => {

    total +=
      hitungHargaPage(page);

  });

  /* custom premium */
  if (
    sizeSelect?.value ===
    "custom"
  ) {
    total += 500;
  }

  return total;

}

/* =====================================
   UPDATE PRICE
===================================== */
export function updatePricePreview() {

  if (!priceDisplay)
    return;

  let harga = 0;

  if (
    manualHargaCheckbox?.checked
  ) {

    harga =
      Math.max(
        500,
        parseInt(
          manualHargaInput?.value
        ) || 500
      );

  } else {

    harga =
      hitungHargaAI();

  }

  priceDisplay.textContent =
    "Harga: " +
    formatRupiah(harga);

}

/* =====================================
   INPUT MANUAL
===================================== */
manualHargaInput?.addEventListener(
  "input",
  () => {

    let val =
      parseInt(
        manualHargaInput.value
      ) || 500;

    val =
      Math.round(
        val / 500
      ) * 500;

    if (val < 500)
      val = 500;

    manualHargaInput.value =
      val;

    updatePricePreview();

  }
);

/* =====================================
   SWITCH
===================================== */
manualHargaCheckbox?.addEventListener(
  "change",
  updatePricePreview
);

/* =====================================
   INIT
===================================== */
updatePricePreview();