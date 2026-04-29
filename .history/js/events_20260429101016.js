/* =====================================
   FILE: js/events.js
   FIX POPUP FINAL
===================================== */

/* HAPUS 2 FUNCTION cekNamaPelanggan LAMA
   karena kamu bikin double function.
   Yang terakhir pakai alert(), makanya popup flat.
*/

/* ---------------------------
   POPUP CUSTOM
--------------------------- */
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

/* ---------------------------
   VALIDASI NAMA FINAL
--------------------------- */
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