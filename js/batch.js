/* =====================================
   FILE: js/batch.js
   Batch List / Harga Manual
===================================== */

/* ---------------------------
   Refresh Batch List UI
--------------------------- */
function refreshBatchList() {
    if (!batchList) return;
  
    batchList.innerHTML = "";
  
    batches.forEach((batch, index) => {
  
      const row =
        document.createElement("div");
  
      row.className = "batch-row";
  
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
  
      /* ------------------
         Input Copy
      ------------------ */
      const copyInput =
        document.createElement("input");
  
      copyInput.type = "number";
      copyInput.min = "1";
      copyInput.value =
        batch.copy || 1;
  
      copyInput.style.width = "60px";
  
      copyInput.onchange = async () => {
        batch.copy = Math.max(
          1,
          parseInt(copyInput.value) || 1
        );
  
        await autoPreview();
        updatePricePreview();
      };
  
      /* ------------------
         Delete Button
      ------------------ */
      const delBtn =
        document.createElement("button");
  
      delBtn.className = "warn";
      delBtn.type = "button";
      delBtn.textContent = "❌";
  
      delBtn.onclick = async () => {
  
        batches.splice(index, 1);
  
        refreshBatchList();
  
        if (!batches.length) {
          clearCanvas();
          resetState();
        } else {
          await autoPreview();
        }
  
        updatePricePreview();
  
        toast("Batch dihapus");
      };
  
      row.appendChild(copyInput);
      row.appendChild(delBtn);
  
      batchList.appendChild(row);
    });
  
    batchList.style.display =
      batches.length ? "block" : "none";
  }
  
  /* ---------------------------
     Harga Manual
  --------------------------- */
  function updatePricePreview() {
  
    if (!priceDisplay) return;
  
    const val = Math.max(
      0,
      parseInt(
        manualHargaInput?.value
      ) || 0
    );
  
    priceDisplay.textContent =
      "Harga: " +
      formatRupiah(val);
  }
  
  /* ---------------------------
     Harga Input Listener
  --------------------------- */
  if (manualHargaInput) {
  
    manualHargaInput.addEventListener(
      "input",
      () => {
  
        let val =
          parseInt(
            manualHargaInput.value
          ) || 0;
  
        /* kelipatan 500 */
        val =
          Math.round(val / 500) * 500;
  
        if (val < 500)
          val = 500;
  
        manualHargaInput.value = val;
  
        updatePricePreview();
      }
    );
  }
  
  /* ---------------------------
     Init Harga
  --------------------------- */
  updatePricePreview();