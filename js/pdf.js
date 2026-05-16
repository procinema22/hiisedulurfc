/* =====================================
   FILE: js/pdf.js
   FINAL MODULE VERSION
   Generate PDF / Open Tab
===================================== */

import {
  state,
  hideInfo,
  userName,
  manualHargaInput
} from "./state.js";

import {
  formatRupiah,
  toast,
  showLoading,
  hideLoading,
  openBlob
} from "./helpers.js";

import {
  drawImageCover,
  drawCircle
} from "./render.js";

/* =====================================
   RENDER FULL SIZE PAGES
===================================== */
async function renderFullPages() {

  const pages = [];

  const fullW = 2480;
  const fullH = 3508;

  for (const page of state.placementsByPage) {

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

  /* =========================
     RECTANGLE
  ========================= */
  if (
    item.type ===
    "rectangle"
  ) {

    drawImageCover(

      pctx,

      item.imgObj,

      item.x,
      item.y,

      item.width,
      item.height,

      item.offsetX,
      item.offsetY,

      item.scale

    );

  }

  /* =========================
     CIRCLE
  ========================= */
  else if (
    item.type ===
    "circle"
  ) {

    drawCircle(

      pctx,

      item.imgObj,

      item.x,
      item.y,

      item.diameter,

      item.offsetX,
      item.offsetY,

      item.scale

    );

  }

}



    pages.push(pc);

  }

  return pages;

}

/* =====================================
   FOOTER LAST PAGE
===================================== */
function addFooter(
  lastCanvas
) {

  /* =========================
     HIDE INFO
  ========================= */
  if (
    hideInfo?.checked
  ) return lastCanvas;

  const ctx2 =
    lastCanvas.getContext(
      "2d"
    );

  const fullW =
    lastCanvas.width;

  const fullH =
    lastCanvas.height;

  const footerY =
    fullH - 120;

  /* =========================
     GARIS FOOTER
  ========================= */
  ctx2.beginPath();

  ctx2.moveTo(
    40,
    footerY - 30
  );

  ctx2.lineTo(
    fullW - 40,
    footerY - 30
  );

  ctx2.strokeStyle =
    "#111";

  ctx2.lineWidth = 2;

  ctx2.stroke();

  /* =========================
     BRAND
  ========================= */
  ctx2.fillStyle =
    "#111";

  ctx2.font =
    "28px Poppins";

  ctx2.textAlign =
    "left";

  ctx2.fillText(
    "SEDULUR FOTO COPY",
    40,
    footerY
  );

  /* =========================
     LABEL
  ========================= */
  ctx2.font =
    "16px Poppins";

  ctx2.fillStyle =
    "#666";

  ctx2.fillText(
    "NAMA PEMESAN",
    40,
    footerY + 28
  );

  ctx2.textAlign =
    "right";

  ctx2.fillText(
    "HARGA",
    fullW - 40,
    footerY + 28
  );

  /* =========================
     NAMA
  ========================= */
  ctx2.font =
    "24px Poppins";

  ctx2.fillStyle =
    "#111";

  ctx2.textAlign =
    "left";

  ctx2.fillText(
    userName?.value
      ?.trim() ||
      "Pemesan",
    40,
    footerY + 58
  );

  /* =========================
     HARGA
  ========================= */
  const priceDisplay =
    document.getElementById(
      "priceDisplay"
    );

  const hargaText =
    priceDisplay?.textContent
      ?.replace(
        "Harga: ",
        ""
      ) || "Rp 0";

  ctx2.font =
    "24px Poppins";

  ctx2.textAlign =
    "right";

  ctx2.fillText(
    hargaText,
    fullW - 40,
    footerY + 58
  );

  return lastCanvas;

}

/* =====================================
   OPEN PDF
===================================== */
export async function openPdfFile() {

  if (
    !state.batches.length
  ) {

    toast(
      "Belum ada foto"
    );

    return;

  }

  showLoading();

  try {

    const pages =
      await renderFullPages();

    if (!pages.length) {

      toast(
        "Belum ada halaman"
      );

      return;

    }

    addFooter(
      pages[
        pages.length - 1
      ]
    );

    const {
      jsPDF
    } = window.jspdf;

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
      pdf.output(
        "blob"
      );

    openBlob(blob);

  } catch (err) {

    console.error(err);

    toast(
      "Gagal membuat PDF"
    );

  } finally {

    hideLoading();

  }

}