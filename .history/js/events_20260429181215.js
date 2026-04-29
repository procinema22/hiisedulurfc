/* =====================================
   FILE: js/events.js
   FINAL PRODUCTION VERSION
===================================== */

window.addEventListener("load", () => {

  /* ---------------------------
     MANUAL HARGA LOCK
  --------------------------- */
  manualHargaCheckbox?.addEventListener("change", () => {

    const aktif = manualHargaCheckbox.checked;

    if (manualHargaBox) {
      manualHargaBox.style.display =
        aktif ? "block" : "none";
    }

    if (aktif) {
      showPopup("Harga manual diaktifkan");

      const harga =
        parseInt(manualHargaInput?.value) || 500;

      if (priceDisplay) {
        priceDisplay.textContent =
          "Harga: Rp " +
          harga.toLocaleString("id-ID");
      }

    } else {
      showPopup("Harga otomatis diaktifkan");
      updatePricePreview();
    }

  });

  /* ---------------------------
     INPUT HARGA MANUAL
  --------------------------- */
  manualHargaInput?.addEventListener("input", () => {

    if (!manualHargaCheckbox.checked) return;

    let harga =
      parseInt(manualHargaInput.value) || 0;

    if (harga < 500) harga = 500;

    manualHargaInput.value = harga;

    if (priceDisplay) {
      priceDisplay.textContent =
        "Harga: Rp " +
        harga.toLocaleString("id-ID");
    }

  });

  /* ---------------------------
     PREVIEW
  --------------------------- */
  previewBtn?.addEventListener("click", async () => {

    if (!batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await autoPreview();
      toast("Preview selesai");
    } catch (err) {
      console.error("Preview error:", err);
      toast("Preview gagal");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     GENERATE
  --------------------------- */
  generateBtn?.addEventListener("click", async () => {

    if (!batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await autoPreview();
      toast("Kolase selesai");
    } catch (err) {
      console.error("Generate error:", err);
      toast("Generate gagal");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     PDF
  --------------------------- */
  downloadPdf?.addEventListener("click", async () => {

    if (!batches.length) {
      toast("Belum ada foto");
      return;
    }

    if (!cekNamaPelanggan()) return;

    showLoading();

    try {
      await openPdfFile();
      toast("PDF dibuka");
    } catch (err) {
      console.error("PDF error:", err);
      toast("Gagal membuka PDF");
    } finally {
      hideLoading();
    }

  });

  /* ---------------------------
     RESET
  --------------------------- */
  resetBtn?.addEventListener("click", () => {

    resetState();

    refreshBatchList();
    clearCanvas();
    updatePricePreview();

    if (pageNav) pageNav.style.display = "none";
    if (upload) upload.value = "";
    if (userName) userName.value = "";

    if (manualHargaCheckbox) manualHargaCheckbox.checked = false;
    if (manualHargaBox) manualHargaBox.style.display = "none";
    if (manualHargaInput) manualHargaInput.value = 500;

    toast("Reset selesai");

  });

  /* ---------------------------
     PAGE NAV
  --------------------------- */
  prevPageBtn?.addEventListener("click", () => {
    showPageAtIndex(currentPageIndex - 1);
  });

  nextPageBtn?.addEventListener("click", () => {
    showPageAtIndex(currentPageIndex + 1);
  });

  /* ---------------------------
     MODE CHANGE
  --------------------------- */
  modeSelect?.addEventListener("change", async () => {

    const mode = modeSelect.value;

    if (circleControls) {
      circleControls.style.display =
        mode === "circle" ? "block" : "none";
    }

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

  });

  /* ---------------------------
     SIZE CHANGE
  --------------------------- */
  sizeSelect?.addEventListener("change", async () => {

    if (customSize) {
      customSize.style.display =
        sizeSelect.value === "custom" &&
        modeSelect?.value !== "circle"
          ? "flex"
          : "none";
    }

    if (batches.length) {
      await autoPreview();
    }

  });

  /* ---------------------------
     LIVE AUTO PREVIEW
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

    el.addEventListener("input", async () => {

      if (manualHargaCheckbox?.checked) return;

      if (batches.length) {
        await autoPreview();
      }

    });

  });

});

/* =====================================
   POPUP IOS STYLE
===================================== */
function showPopup(message = "Notifikasi") {

  const popup = document.getElementById("popupNotif");
  const text = document.getElementById("popupText");

  if (!popup || !text) return;

  text.textContent = message;
  popup.classList.add("show");

  clearTimeout(window.popupTimer);

  window.popupTimer = setTimeout(() => {
    popup.classList.remove("show");
  }, 2200);
}

/* =====================================
   VALIDASI NAMA WAJIB
===================================== */
function cekNamaPelanggan() {

  const nama = userName?.value.trim();

  if (nama === "") {

    showPopup("Nama pelanggan wajib diisi!");

    userName.focus();
    userName.style.border = "2px solid #ef4444";

    setTimeout(() => {
      userName.style.border = "";
    }, 1800);

    return false;
  }

  return true;
}
canvas.addEventListener("mousedown", ...)
canvas.addEventListener("mousemove", ...)
canvas.addEventListener("mouseup", ...)
canvas.addEventListener("wheel", ...)