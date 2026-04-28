const input = document.getElementById("heicInput");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadJPG");

let convertedBlob = null;


/* ================= PREVIEW ================= */

input.addEventListener("change", function(){

const file = this.files[0];

if(!file) return;

const url = URL.createObjectURL(file);

preview.src = url;
preview.style.display = "block";

});


/* ================= CONVERT ================= */

async function convertHEIC(){

const file = input.files[0];

if(!file){
alert("Upload file HEIC dulu");
return;
}

try{

const result = await heic2any({
blob:file,
toType:"image/jpeg",
quality:0.9
});

convertedBlob = result;

const url = URL.createObjectURL(result);

downloadBtn.href = url;
downloadBtn.download = "convert.jpg";
downloadBtn.style.display = "block";

}catch(err){

alert("Convert gagal");

}

}