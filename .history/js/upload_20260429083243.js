/* =====================================
   FILE: js/upload.js
   Upload / Paste / Drag Drop
===================================== */

/* ---------------------------
   Tambah Files ke Batch
--------------------------- */
async function addFilesToBatch(files) {
    if (!files || !files.length) return;
  
    const mode =
      modeSelect?.value || "normal";
  
    const batchData = {
      files: [...files],
      copy: 1,
      mode: mode
    };
  
    /* ukuran */
    if (sizeSelect?.value === "custom") {
      batchData.size = "custom";
      batchData.customW =
        num(customW?.value, 2);
      batchData.customH =
        num(customH?.value, 3);
    } else {
      batchData.size =
        sizeSelect?.value || "2x3";
    }
  
    /* circle */
    if (mode === "circle") {
      batchData.circleDiameter =
        num(circleDiameter?.value, 4);
    }
  
    batches.push(batchData);
  
    refreshBatchList();
    updatePricePreview();
  
    toast("Foto ditambahkan");
  }
  
  /* ---------------------------
     Input Upload
  --------------------------- */
  if (upload) {
    upload.onchange = async e => {
      const files = Array.from(
        e.target.files || []
      );
  
      if (!files.length) return;
  
      showLoading();
  
      await addFilesToBatch(files);
      await autoPreview();
  
      upload.value = "";
      hideLoading();
    };
  }
  
  /* ---------------------------
     Drag & Drop Area
  --------------------------- */
  if (dropArea && upload) {
  
    dropArea.addEventListener(
      "click",
      () => upload.click()
    );
  
    ["dragenter", "dragover"]
      .forEach(evt => {
  
      dropArea.addEventListener(
        evt,
        e => {
          e.preventDefault();
          dropArea.classList.add("hover");
        }
      );
    });
  
    ["dragleave", "drop"]
      .forEach(evt => {
  
      dropArea.addEventListener(
        evt,
        () => {
          dropArea.classList.remove("hover");
        }
      );
    });
  
    dropArea.addEventListener(
      "drop",
      async e => {
        e.preventDefault();
  
        const files = Array.from(
          e.dataTransfer.files || []
        );
  
        if (!files.length) return;
  
        showLoading();
  
        await addFilesToBatch(files);
        await autoPreview();
  
        hideLoading();
      }
    );
  }
  
  /* ---------------------------
     Paste Ctrl + V Gambar
  --------------------------- */
  document.addEventListener(
    "paste",
    async e => {
  
      if (!e.clipboardData) return;
  
      const items =
        e.clipboardData.items;
  
      const files = [];
  
      for (const item of items) {
        if (
          item.type &&
          item.type.includes("image")
        ) {
          files.push(
            item.getAsFile()
          );
        }
      }
  
      if (!files.length) return;
  
      showLoading();
  
      await addFilesToBatch(files);
      await autoPreview();
  
      hideLoading();
    }
  );