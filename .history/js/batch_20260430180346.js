/* =====================================
   FILE: js/batch.js
   FINAL AUTO PRICE + MANUAL PRICE
===================================== */

import {
  batchList,
  manualHargaInput,
  manualHargaCheckbox,
  priceDisplay,
  state,
  resetState,
  modeSelect,
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

    const copyInput = document.createElement("input");
    copyInput.type = "number";
    copyInput.min = "1";
    copyInput.value = batch.copy || 1;
    copyInput.style.width = "60px";

    copyInput.addEventListener("change", async () => {

      batch.copy =
        Math.max(
          1,
          parseInt(copyInput.value) || 1
        );

      await autoPreview();
      updatePricePreview();

    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "warn";
    delBtn.textContent = "❌";

    delBtn.addEventListener("click", async () => {

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

    });

    row.appendChild(copyInput);
    row.appendChild(delBtn);
    batchList.appendChild(row);

  });

  batchList.style.display =
    state.batches.length ? "block" : "none";

}

/* =====================================
   AUTO PRICE SYSTEM
===================================== */
function hitungHargaOtomatis() {

  const used =
    state.batches.reduce(
      (n, b) =>
        n + ((b.files?.length || 0) * (b.copy || 1)),
      0
    );

  /* fallback kapasitas */
  let maxSlot = state.maxSlots || 20;

  let persen = used / maxSlot;

  if (persen > 1) persen = 1;

  let harga = 0;

  /* tier harga */
  if (persen <= 0.25) harga = 500;
  else if (persen <= 0.50) harga = 1000;
  else if (persen <= 0.75) harga = 1500;
  else harga = 2000;

  /* premium mode lingkaran */
  if (modeSelect?.value === "circle") {
    harga += 500;
  }

  /* premium custom size */
  if (sizeSelect?.value === "custom") {
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

    harga = Math.max(
      500,
      parseInt(
        manualHargaInput?.value
      ) || 500
    );

  } else {

    harga = hitungHargaOtomatis();

  }

  priceDisplay.textContent =
    "Harga: " + formatRupiah(harga);

}

/* =====================================
   INPUT LISTENER MANUAL
===================================== */
if (manualHargaInput) {

  manualHargaInput.addEventListener(
    "input",
    () => {

      let val =
        parseInt(
          manualHargaInput.value
        ) || 500;

      val =
        Math.round(val / 500) * 500;

      if (val < 500) val = 500;

      manualHargaInput.value = val;

      updatePricePreview();

    }
  );

}

/* =====================================
   SWITCH LISTENER
===================================== */
manualHargaCheckbox?.addEventListener(
  "change",
  updatePricePreview
);

/* =====================================
   INIT
===================================== */
updatePricePreview();