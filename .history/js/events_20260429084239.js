window.addEventListener("load", () => {

    previewBtn.addEventListener("click", async () => {
      console.log("preview klik");
      await autoPreview();
    });
  
    generateBtn.addEventListener("click", async () => {
      console.log("generate klik");
      await autoPreview();
      toast("Kolase selesai");
    });
  
    downloadPdf.addEventListener("click", async () => {
      console.log("pdf klik");
      await openPdfFile();
    });
  
    resetBtn.addEventListener("click", () => {
      console.log("reset klik");
  
      resetState();
      refreshBatchList();
      clearCanvas();
      updatePricePreview();
    });
  
    prevPageBtn?.addEventListener("click", () => {
      showPageAtIndex(currentPageIndex - 1);
    });
  
    nextPageBtn?.addEventListener("click", () => {
      showPageAtIndex(currentPageIndex + 1);
    });
  
  });