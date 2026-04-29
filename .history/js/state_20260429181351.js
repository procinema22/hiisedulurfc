/* =====================================
   FILE: js/state.js
   Global State / Element References
===================================== */

/* ---------------------------
   ELEMENT REFERENCES
--------------------------- */
export const upload = document.getElementById("upload");
export const canvas = document.getElementById("canvas");
export const ctx = canvas ? canvas.getContext("2d") : null;

export const batchList = document.getElementById("batchList");

export const previewBtn = document.getElementById("previewBtn");
export const generateBtn = document.getElementById("generateBtn");
export const downloadPdf = document.getElementById("downloadPdf");
export const resetBtn = document.getElementById("reset");

export const pageNav = document.getElementById("pageNav");
export const prevPageBtn = document.getElementById("prevPage");
export const nextPageBtn = document.getElementById("nextPage");
export const pageIndicator = document.getElementById("pageIndicator");

export const dropArea = document.getElementById("dropArea");

export const modeSelect = document.getElementById("modeSelect");
export const circleControls = document.getElementById("circleControls");
export const circleDiameter = document.getElementById("circleDiameter");

export const sizeSelect = document.getElementById("sizeSelect");
export const customSize = document.getElementById("customSize");
export const customW = document.getElementById("customW");
export const customH = document.getElementById("customH");

export const marginTop = document.getElementById("marginTop");
export const marginBottom = document.getElementById("marginBottom");
export const marginLeft = document.getElementById("marginLeft");
export const marginRight = document.getElementById("marginRight");

export const gapInput = document.getElementById("gap");

export const manualHargaCheckbox =
  document.getElementById("manualHargaCheckbox");

export const manualHargaBox =
  document.getElementById("manualHargaBox");

export const manualHargaInput =
  document.getElementById("manualHargaInput");

export const userName =
  document.getElementById("userName");

export const hideInfo =
  document.getElementById("hideInfo");

export const priceDisplay =
  document.getElementById("priceDisplay");

/* ---------------------------
   CONSTANTS
--------------------------- */
export const PX_PER_CM = 118;
export const PREVIEW_SCALE = 0.25;

/* ---------------------------
   MAIN APP STATE
--------------------------- */
export const state = {
  batches: [],
  placementsByPage: [],
  pagesCache: [],

  currentPageIndex: 0,

  selectedPlacement: null,
  isDragging: false,
  dragStart: null
};

/* ---------------------------
   RESET STATE
--------------------------- */
export function resetState() {
  state.batches = [];
  state.placementsByPage = [];
  state.pagesCache = [];

  state.currentPageIndex = 0;

  state.selectedPlacement = null;
  state.isDragging = false;
  state.dragStart = null;
}

/* ---------------------------
   INIT BLANK CANVAS
--------------------------- */
export function initCanvas() {
  if (!ctx || !canvas) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
}