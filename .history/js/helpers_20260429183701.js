/* =====================================
   FILE: js/helpers.js
   FINAL MODULE VERSION
   Utility Functions
===================================== */

import {
  canvas,
  ctx,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  gapInput,
  PX_PER_CM
} from "./state.js";

/* =====================================
   FORMAT RUPIAH
===================================== */
export function formatRupiah(
  value
) {

  const angka =
    parseInt(value) || 0;

  return (
    "Rp " +
    angka.toLocaleString(
      "id-ID"
    )
  );

}

/* =====================================
   SAFE NUMBER
===================================== */
export function num(
  val,
  fallback = 0
) {

  const n =
    parseFloat(val);

  return isNaN(n)
    ? fallback
    : n;

}

/* =====================================
   CLAMP
===================================== */
export function clamp(
  val,
  min,
  max
) {

  return Math.max(
    min,
    Math.min(
      max,
      val
    )
  );

}

/* =====================================
   WAIT
===================================== */
export function wait(
  ms = 200
) {

  return new Promise(
    resolve => {
      setTimeout(
        resolve,
        ms
      );
    }
  );

}

/* =====================================
   TOAST
===================================== */
export function toast(
  msg = "Sukses"
) {

  const el =
    document.getElementById(
      "toast"
    );

  if (!el) return;

  el.textContent =
    msg;

  el.classList.add(
    "show"
  );

  setTimeout(() => {

    el.classList.remove(
      "show"
    );

  }, 2200);

}

/* =====================================
   LOADING
===================================== */
export function showLoading() {

  const el =
    document.getElementById(
      "loadingOverlay"
    );

  if (el) {
    el.classList.add(
      "show"
    );
  }

}

export function hideLoading() {

  const el =
    document.getElementById(
      "loadingOverlay"
    );

  if (el) {
    el.classList.remove(
      "show"
    );
  }

}

/* =====================================
   CLEAR CANVAS
===================================== */
export function clearCanvas() {

  if (!ctx || !canvas)
    return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}

/* =====================================
   LOAD IMAGE
===================================== */
export function loadImage(
  file
) {

  return new Promise(
    resolve => {

      if (!file)
        return resolve(
          null
        );

      const reader =
        new FileReader();

      reader.onload =
        e => {

          const img =
            new Image();

          img.onload =
            () =>
              resolve(
                img
              );

          img.onerror =
            () =>
              resolve(
                null
              );

          img.src =
            e.target.result;

        };

      reader.readAsDataURL(
        file
      );

    }
  );

}

/* =====================================
   OPEN BLOB
===================================== */
export function openBlob(
  blob
) {

  const url =
    URL.createObjectURL(
      blob
    );

  window.open(
    url,
    "_blank"
  );

}

/* =====================================
   GET MARGINS PX
===================================== */
export function getMarginsPx() {

  return {

    top:
      num(
        marginTop?.value,
        10
      ) /
      10 *
      PX_PER_CM,

    bottom:
      num(
        marginBottom?.value,
        10
      ) /
      10 *
      PX_PER_CM,

    left:
      num(
        marginLeft?.value,
        10
      ) /
      10 *
      PX_PER_CM,

    right:
      num(
        marginRight?.value,
        10
      ) /
      10 *
      PX_PER_CM

  };

}

/* =====================================
   GET GAP
===================================== */
export function getGap() {

  return Math.max(
    0,
    parseInt(
      gapInput?.value
    ) || 20
  );

}