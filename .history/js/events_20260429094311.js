/* =====================================
   FILE: js/events.js
   FINAL CLEAN VERSION
===================================== */

window.addEventListener("load", () => {

    /* ---------------------------
       PREVIEW
    --------------------------- */
    previewBtn?.addEventListener(
      "click",
      async () => {
  
        if (!batches.length) {
          toast("Belum ada foto");
          return;
        }
  
        showLoading();
  
        try {
          await autoPreview();
          toast("Preview selesai");
        } catch (err) {
          console.error(
            "Preview error:",
            err
          );
          toast("Preview gagal");
        } finally {
          hideLoading();
        }
      }
    );
  
    /* ---------------------------
       GENERATE
    --------------------------- */
    generateBtn?.addEventListener(
      "click",
      async () => {
  
        if (!batches.length) {
          toast("Belum ada foto");
          return;
        }
  
        showLoading();
  
        try {
          await autoPreview();
          toast("Kolase selesai");
        } catch (err) {
          console.error(
            "Generate error:",
            err
          );
          toast("Generate gagal");
        } finally {
          hideLoading();
        }
      }
    );
  
    /* ---------------------------
       PDF
    --------------------------- */
    downloadPdf?.addEventListener(
      "click",
      async () => {
  
        if (!batches.length) {
          toast("Belum ada foto");
          return;
        }
  
        await openPdfFile();
      }
    );
  
    /* ---------------------------
       RESET
    --------------------------- */
    resetBtn?.addEventListener(
      "click",
      () => {
  
        resetState();
  
        refreshBatchList();
        clearCanvas();
        updatePricePreview();
  
        if (pageNav) {
          pageNav.style.display =
            "none";
        }
  
        if (upload) {
          upload.value = "";
        }
  
        if (userName) {
          userName.value = "";
        }
  
        toast("Reset selesai");
      }
    );
  
    /* ---------------------------
       PAGE NAV
    --------------------------- */
    prevPageBtn?.addEventListener(
      "click",
      () => {
        showPageAtIndex(
          currentPageIndex - 1
        );
      }
    );
  
    nextPageBtn?.addEventListener(
      "click",
      () => {
        showPageAtIndex(
          currentPageIndex + 1
        );
      }
    );
  
    /* ---------------------------
       MODE CHANGE
    --------------------------- */
    modeSelect?.addEventListener(
      "change",
      async () => {
  
        const mode =
          modeSelect.value;
  
        /* circle panel */
        if (circleControls) {
          circleControls.style.display =
            mode === "circle"
              ? "block"
              : "none";
        }
  
        /* custom size panel */
        if (customSize) {
          customSize.style.display =
            mode !== "circle" &&
            sizeSelect?.value === "custom"
              ? "flex"
              : "none";
        }
  
        if (batches.length) {
          await autoPreview();
        }
      }
    );
  
    /* ---------------------------
       SIZE CHANGE
    --------------------------- */
    sizeSelect?.addEventListener(
      "change",
      async () => {
  
        if (customSize) {
          customSize.style.display =
            sizeSelect.value ===
              "custom" &&
            modeSelect?.value !==
              "circle"
              ? "flex"
              : "none";
        }
  
        if (batches.length) {
          await autoPreview();
        }
      }
    );
  
    /* ---------------------------
       LIVE UPDATE INPUT
    --------------------------- */
    [
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      gapInput,
      customW,
      customH,
      circleDiameter
    ].forEach(el => {
  
      if (!el) return;
  
      el.addEventListener(
        "input",
        async () => {
  
          if (batches.length) {
            await autoPreview();
          }
        }
      );
    });
  
  });
  // TAMBAHKAN di js/events.js atau file tombol action kamu

function cekNamaPelanggan() {
  const nama = userName.value.trim();

  if (nama === "") {
    toast("Nama pelanggan wajib diisi!");
    userName.focus();
    userName.style.border = "2px solid red";

    setTimeout(() => {
      userName.style.border = "";
    }, 2000);

    return false;
  }

  return true;
}