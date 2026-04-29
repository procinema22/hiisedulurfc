/* =====================================
   FILE: js/pdf.js
   Generate PDF / Open Tab
===================================== */

/* ---------------------------
   Render Full Resolution Pages
--------------------------- */
async function renderFullPages() {

    const pages = [];
  
    const fullW = 2480;
    const fullH = 3508;
  
    for (const page of placementsByPage) {
  
      const pc =
        document.createElement(
          "canvas"
        );
  
      pc.width = fullW;
      pc.height = fullH;
  
      const pctx =
        pc.getContext("2d");
  
      pctx.fillStyle =
        "#ffffff";
  
      pctx.fillRect(
        0,
        0,
        fullW,
        fullH
      );
  
      for (const item of page) {
  
        if (item.isRectangle) {
  
          drawImageCover(
            pctx,
            item.imgObj,
            item.x,
            item.y,
            item.boxW,
            item.boxH
          );
        }
  
        else if (item.isCircle) {
  
          drawCircle(
            pctx,
            item.imgObj,
            item.x,
            item.y,
            item.diameterPx
          );
        }
      }
  
      pages.push(pc);
    }
  
    return pages;
  }
  
  /* ---------------------------
     Tambah Footer Halaman Terakhir
  --------------------------- */
  function addFooter(lastCanvas) {
  
    if (hideInfo?.checked)
      return lastCanvas;
  
    const ctx2 =
      lastCanvas.getContext("2d");
  
    const fullW =
      lastCanvas.width;
  
    const fullH =
      lastCanvas.height;
  
    const footerY =
      fullH - 120;
  
    ctx2.beginPath();
    ctx2.moveTo(0, footerY - 30);
    ctx2.lineTo(fullW, footerY - 30);
    ctx2.strokeStyle = "#111";
    ctx2.lineWidth = 3;
    ctx2.stroke();
  
    ctx2.fillStyle = "#111";
    ctx2.font =
      "bold 30px Poppins";
  
    ctx2.fillText(
      "SEDULUR FOTO COPY",
      40,
      footerY
    );
  
    ctx2.font =
      "18px Poppins";
  
    ctx2.fillStyle = "#666";
  
    ctx2.fillText(
      "NAMA PEMESAN",
      40,
      footerY + 28
    );
  
    ctx2.fillText(
      "HARGA",
      fullW - 180,
      footerY + 28
    );
  
    ctx2.font =
      "bold 26px Poppins";
  
    ctx2.fillStyle = "#111";
  
    ctx2.fillText(
      userName?.value?.trim()
        || "Pemesan",
      40,
      footerY + 58
    );
  
    ctx2.fillText(
      formatRupiah(
        manualHargaInput?.value
      ),
      fullW - 180,
      footerY + 58
    );
  
    return lastCanvas;
  }
  
  /* ---------------------------
     Open PDF
  --------------------------- */
  async function openPdfFile() {
  
    if (!batches.length) {
      toast("Belum ada foto");
      return;
    }
  
    showLoading();
  
    try {
  
      const pages =
        await renderFullPages();
  
      const last =
        pages[
          pages.length - 1
        ];
  
      addFooter(last);
  
      const { jsPDF } =
        window.jspdf;
  
      const pdf =
        new jsPDF(
          "p",
          "pt",
          "a4"
        );
  
      for (
        let i = 0;
        i < pages.length;
        i++
      ) {
  
        if (i > 0)
          pdf.addPage();
  
        pdf.addImage(
          pages[i].toDataURL(
            "image/jpeg",
            0.95
          ),
          "JPEG",
          0,
          0,
          595,
          842
        );
      }
  
      const blob =
        pdf.output("blob");
  
      openBlob(blob);
  
    } catch (err) {
  
      console.error(err);
      toast("Gagal PDF");
  
    } finally {
  
      hideLoading();
    }
  }