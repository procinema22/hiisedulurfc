/* =====================================
   FILE: js/upload.js
   FINAL CLEAN VERSION
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
  
    /* -----------------------
       MODE RECTANGLE SIZE
    ----------------------- */
    if (mode !== "circle") {
  
      if (sizeSelect?.value === "custom") {
  
        batchData.size = "custom";
  
        batchData.customW =
          Math.max(
            1,
            num(customW?.value, 2)
          );
  
        batchData.customH =
          Math.max(
            1,
            num(customH?.value, 3)
          );
  
      } else {
  
        batchData.size =
          sizeSelect?.value || "2x3";
      }
    }
  
    /* -----------------------
       MODE CIRCLE
       diameter custom langsung
    ----------------------- */
    if (mode === "circle") {
  
      batchData.size = "circle";
  
      batchData.circleDiameter =
        Math.max(
          1,
          num(
            circleDiameter?.value,
            4
          )
        );
    }
  
    /* -----------------------
       SIMPAN DATA
    ----------------------- */
    batches.push(batchData);
  
    refreshBatchList();
    updatePricePreview();
  
    toast("Foto ditambahkan");
  }
  
  /* ---------------------------
     Helper Proses Upload
  --------------------------- */
  async function processIncomingFiles(files) {
  
    if (!files || !files.length) return;
  
    showLoading();
  
    try {
  
      await addFilesToBatch(files);
      await autoPreview();
  
    } catch (err) {
  
      console.error(
        "Upload gagal:",
        err
      );
  
      toast("Gagal memproses foto");
  
    } finally {
  
      hideLoading();
    }
  }
  
  /* ---------------------------
     Input Upload
  --------------------------- */
  if (upload) {
  
    upload.addEventListener(
      "change",
      async e => {
  
        const files =
          Array.from(
            e.target.files || []
          );
  
        if (!files.length) return;
  
        await processIncomingFiles(
          files
        );
  
        upload.value = "";
      }
    );
  }
  
  /* ---------------------------
     Drag & Drop
  --------------------------- */
  if (dropArea && upload) {
  
    /* klik area = buka file */
    dropArea.addEventListener(
      "click",
      () => upload.click()
    );
  
    /* drag enter */
    ["dragenter", "dragover"]
      .forEach(evt => {
  
        dropArea.addEventListener(
          evt,
          e => {
  
            e.preventDefault();
            e.stopPropagation();
  
            dropArea.classList.add(
              "hover"
            );
          }
        );
      });
  
    /* keluar drag */
    ["dragleave", "drop"]
      .forEach(evt => {
  
        dropArea.addEventListener(
          evt,
          e => {
  
            e.preventDefault();
            e.stopPropagation();
  
            dropArea.classList.remove(
              "hover"
            );
          }
        );
      });
  
    /* drop file */
    dropArea.addEventListener(
      "drop",
      async e => {
  
        const files =
          Array.from(
            e.dataTransfer.files || []
          );
  
        if (!files.length) return;
  
        await processIncomingFiles(
          files
        );
      }
    );
  }
  
  /* ---------------------------
     Paste Ctrl + V
  --------------------------- */
  document.addEventListener(
    "paste",
    async e => {
  
      if (!e.clipboardData)
        return;
  
      const items =
        e.clipboardData.items;
  
      const files = [];
  
      for (const item of items) {
  
        if (
          item.type &&
          item.type.includes(
            "image"
          )
        ) {
          const file =
            item.getAsFile();
  
          if (file)
            files.push(file);
        }
      }
  
      if (!files.length)
        return;
  
      await processIncomingFiles(
        files
      );
    }
  );