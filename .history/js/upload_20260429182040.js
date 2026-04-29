/* =====================================
   FILE: js/upload.js
   FINAL PRO VERSION
   Upload / Paste / Drag Drop
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
  num
} from "./helpers.js";

import {
  autoPreview
} from "./layout.js";

import {
  refreshBatchList,
  updatePricePreview,
  toast,
  showLoading,
  hideLoading
} from "./main.js";

/* =====================================
   ADD FILES TO BATCH
===================================== */
export async function addFilesToBatch(files) {

  if (!files || !files.length) return;

  const mode =
    modeSelect?.value ||
    "normal";

  const batchData = {
    files: [...files],
    copy: 1,
    mode
  };

  /* ---------------------------
     RECTANGLE MODE
  --------------------------- */
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

  /* ---------------------------
     CIRCLE MODE
  --------------------------- */
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

  /* ---------------------------
     SAVE TO STATE
  --------------------------- */
  state.batches.push(
    batchData
  );

  refreshBatchList();

  await updatePricePreview();

  toast("Foto ditambahkan");

}

/* =====================================
   PROCESS FILES
===================================== */
async function processIncomingFiles(files) {

  if (!files || !files.length)
    return;

  showLoading();

  try {

    await addFilesToBatch(
      files
    );

    await autoPreview();

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
   INPUT FILE
===================================== */
if (upload) {

  upload.addEventListener(
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

}

/* =====================================
   DRAG DROP
===================================== */
if (dropArea && upload) {

  /* click area */
  dropArea.addEventListener(
    "click",
    () => upload.click()
  );

  /* drag hover */
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

  /* remove hover */
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

  /* drop file */
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

/* =====================================
   PASTE CTRL + V
===================================== */
document.addEventListener(
  "paste",
  async e => {

    if (
      !e.clipboardData
    ) return;

    const items =
      e.clipboardData
        .items;

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