/* =====================================
   FILE: js/batch.js
   TRUE FINAL FIX
   NO PRICE 0 + SUPPORT CIRCLE
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

    const row = document.createElement("div");
    row.className = "batch-row";

    const sizeText =
      batch.size === "custom"
        ? `${batch.customW} x ${batch.customH}`
        : (batch.size || "2x3").replace("x", " x ");

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
    copyInput.value = batch.copy || 1;
    copyInput.style.width = "60px";

    copyInput.addEventListener(
      "change",
      async () => {

        batch.copy =
          Math.max(
            1,
            parseInt(copyInput.value) || 1
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

        state.batches.splice(index, 1);

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
   AI AUTO PRICE
===================================== */
function hitungHargaAI() {

  const page =
    state.placementsByPage?.[0] || [];

  /* jika ada foto tapi page belum siap */
  if (!page.length) {

    const adaFoto =
      state.batches.some(
        b => (b.files?.length || 0) > 0
      );

    return adaFoto ? 500 : 0;
  }

  let totalArea = 0;
  let circleCount = 0;

  const pageArea =
    2480 * 3508;

  page.forEach(item => {

    /* circle */
    if (item.isCircle) {

      circleCount++;

      const d =
        item.diameterPx ||
        item.boxW ||
        item.boxH ||
        0;

      const r = d / 2;

      totalArea +=
        Math.PI * r * r;

    }

    /* rectangle */
    else {

      const w =
        item.boxW || 0;

      const h =
        item.boxH || 0;

      totalArea += w * h;

    }

  });

  let persen =
    totalArea / pageArea;

  if (persen < 0)
    persen = 0;

  if (persen > 1)
    persen = 1;

  let harga = 500;

  /* tier isi halaman */
  if (persen <= 0.25)
    harga = 500;

  else if (persen <= 0.50)
    harga = 1000;

  else if (persen <= 0.75)
    harga = 1500;

  else
    harga = 2000;

  /* premium lingkaran */
  if (circleCount > 0) {

    if (circleCount <= 4)
      harga += 500;

    else if (circleCount <= 8)
      harga += 750;

    else
      harga += 1000;

  }

  /* premium custom */
  if (
    sizeSelect?.value ===
    "custom"
  ) {
    harga += 500;
  }

  return harga;

}

/* =====================================
   UPDATE PRICE
===================================== */
export function updatePricePreview() {

  if (!priceDisplay) return;

  const manualMode =
    manualHargaCheckbox?.checked;

  let harga = 0;

  if (manualMode) {

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