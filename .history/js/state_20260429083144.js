/* =====================================
   FILE: js/state.js
   Global State / Element References
===================================== */

/* ---------------------------
   ELEMENT REFERENCES
--------------------------- */
const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const batchList = document.getElementById("batchList");

const previewBtn = document.getElementById("previewBtn");
const generateBtn = document.getElementById("generateBtn");
const downloadPdf = document.getElementById("downloadPdf");
const resetBtn = document.getElementById("reset");

const pageNav = document.getElementById("pageNav");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");

const dropArea = document.getElementById("dropArea");

const modeSelect = document.getElementById("modeSelect");
const circleControls = document.getElementById("circleControls");
const circleDiameter = document.getElementById("circleDiameter");

const sizeSelect = document.getElementById("sizeSelect");
const customSize = document.getElementById("customSize");
const customW = document.getElementById("customW");
const customH = document.getElementById("customH");

const marginTop = document.getElementById("marginTop");
const marginBottom = document.getElementById("marginBottom");
const marginLeft = document.getElementById("marginLeft");
const marginRight = document.getElementById("marginRight");

const gapInput = document.getElementById("gap");

const manualHargaCheckbox =
  document.getElementById("manualHargaCheckbox");

const manualHargaBox =
  document.getElementById("manualHargaBox");

const manualHargaInput =
  document.getElementById("manualHargaInput");

const userName =
  document.getElementById("userName");

const hideInfo =
  document.getElementById("hideInfo");

const priceDisplay =
  document.getElementById("priceDisplay");

/* ---------------------------
   CONSTANTS
--------------------------- */
const PX_PER_CM = 118;
const PREVIEW_SCALE = 0.25;

/* ---------------------------
   GLOBAL DATA
--------------------------- */

/*
batches = daftar upload

[
 {
   files:[File,File],
   copy:1,
   mode:"normal",
   size:"2x3"
 }
]
*/
let batches = [];

/*
placementsByPage = hasil layout

[
 [ ...halaman1 ],
 [ ...halaman2 ]
]
*/
let placementsByPage = [];

/*
preview cache
*/
let pagesCache = [];

/* ---------------------------
   UI STATE
--------------------------- */
let currentPageIndex = 0;

/* ---------------------------
   RESET STATE
--------------------------- */
function resetState() {
  batches = [];
  placementsByPage = [];
  pagesCache = [];
  currentPageIndex = 0;
}

/* ---------------------------
   INITIAL CANVAS
--------------------------- */
ctx.fillStyle = "#ffffff";
ctx.fillRect(
  0,
  0,
  canvas.width,
  canvas.height
);