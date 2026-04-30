/* =====================================
   FILE: js/upload.js
   FINAL FIXED VERSION
   Upload langsung update harga
===================================== */

import {
  upload,
  dropArea,
  modeSelect,
  sizeSelect,
  customW,
  customH,
  circleDiameter,
  state
} from "./state.js";

import {
  num,
  toast,
  showLoading,
  hideLoading
} from "./helpers.js";

import {
  autoPreview
} from "./layout.js";

import {
  refreshBatchList,
  updatePricePreview
} from "./batch.js";

console.log("UPLOAD MODULE READY");

/* =====================================
   ADD FILES TO BATCH
===================================== */
export async function addFilesToBatch(files) {

  if (!files || !files.length)
    return;

  const mode =
    modeSelect?.value ||
    "normal";

  const batchData = {
    files: [...files],
    copy: 1,
    mode
  };

  /* =========================
     RECTANGLE MODE
  ========================= */
  if (mode !== "circle") {

    if (
      sizeSelect?.value ===
      "custom"
    ) {

      batchData.size =
        "custom";

      batchData.customW =
        Math.max(
          1,
          num(
            customW?.value,
            2
          )
        );

      batchData.customH =
        Math.max(
          1,
          num(
            customH?.value,
            3
          )
        );

    } else {

      batchData.size =
        sizeSelect?.value ||
        "2x3";

    }

  }

  /* =========================
     CIRCLE MODE
  ========================= */
  if (mode === "circle") {

    batchData.size =
      "circle";

    batchData.circleDiameter =
      Math.max(
        1,
        num(
          circleDiameter?.value,
          4
        )
      );

  }

  /* =========================
     SAVE STATE
  ========================= */
  state.batches.push(
    batchData
  );

  refreshBatchList();

  toast(
    "Foto ditambahkan"
  );

}

/* =====================================
   PROCESS FILES
===================================== */
async function processIncomingFiles(files) {

  if (!files || !files.length)
    return;

  showLoading();

  try {

    /* simpan batch */
    await addFilesToBatch(
      files
    );

    /* bangun layout */
    await autoPreview();

    /* baru hitung harga */
    updatePricePreview();

  } catch (err) {

    console.error(
      "Upload gagal:",
      err
    );

    toast(
      "Gagal memproses foto"
    );

  } finally {

    hideLoading();

  }

}

/* =====================================
   DOM READY
===================================== */
window.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log(
      "UPLOAD DOM READY"
    );

    /* =========================
       INPUT FILE
    ========================= */
    upload?.addEventListener(
      "change",
      async e => {

        const files =
          Array.from(
            e.target.files ||
            []
          );

        if (!files.length)
          return;

        await processIncomingFiles(
          files
        );

        upload.value = "";

      }
    );

    /* =========================
       DROP AREA
    ========================= */
    if (dropArea && upload) {

      dropArea.addEventListener(
        "click",
        () => upload.click()
      );

      [
        "dragenter",
        "dragover"
      ].forEach(evt => {

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

      [
        "dragleave",
        "drop"
      ].forEach(evt => {

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

      dropArea.addEventListener(
        "drop",
        async e => {

          const files =
            Array.from(
              e.dataTransfer
                .files || []
            );

          if (!files.length)
            return;

          await processIncomingFiles(
            files
          );

        }
      );

    }

    /* =========================
       PASTE IMAGE
    ========================= */
    document.addEventListener(
      "paste",
      async e => {

        if (
          !e.clipboardData
        ) return;

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
              files.push(
                file
              );

          }

        }

        if (!files.length)
          return;

        await processIncomingFiles(
          files
        );

      }
    );

  }
);