/* =====================================
   FILE: js/batch.js
   FINAL MODULE VERSION
   Batch List / Harga Manual
===================================== */

import {
  batchList,
  manualHargaInput,
  priceDisplay,
  state,
  resetState
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

  state.batches.forEach(
    (batch, index) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "batch-row";

      const sizeText =
        batch.size ===
        "custom"
          ? `${batch.customW} x ${batch.customH}`
          : (
              batch.size ||
              "2x3"
            ).replace(
              "x",
              " x "
            );

      row.innerHTML = `
        <div style="flex:1">
          <strong>
            Batch ${index + 1}
          </strong>

          <div class="small">
            ${
              (
                batch.files ||
                []
              ).length
            } foto
            — ${sizeText}
            — mode:
            ${batch.mode}
          </div>
        </div>
      `;

      /* copy input */
      const copyInput =
        document.createElement(
          "input"
        );

      copyInput.type =
        "number";

      copyInput.min =
        "1";

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

      /* delete btn */
      const delBtn =
        document.createElement(
          "button"
        );

      delBtn.type =
        "button";

      delBtn.className =
        "warn";

      delBtn.textContent =
        "❌";

      delBtn.addEventListener(
        "click",
        async () => {

          state.batches.splice(
            index,
            1
          );

          refreshBatchList();

          if (
            !state.batches.length
          ) {

            clearCanvas();

            resetState();

          } else {

            await autoPreview();

          }

          updatePricePreview();

          toast(
            "Batch dihapus"
          );

        }
      );

      row.appendChild(
        copyInput
      );

      row.appendChild(
        delBtn
      );

      batchList.appendChild(
        row
      );

    }
  );

  batchList.style.display =
    state.batches.length
      ? "block"
      : "none";

}

/* =====================================
   UPDATE PRICE
===================================== */
export function updatePricePreview() {

  if (
    !priceDisplay
  ) return;

  const val =
    Math.max(
      0,
      parseInt(
        manualHargaInput?.value
      ) || 0
    );

  priceDisplay.textContent =
    "Harga: " +
    formatRupiah(val);

}

/* =====================================
   INPUT LISTENER
===================================== */
if (manualHargaInput) {

  manualHargaInput.addEventListener(
    "input",
    () => {

      let val =
        parseInt(
          manualHargaInput.value
        ) || 0;

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

}

/* =====================================
   INIT
===================================== */
updatePricePreview();