const input = document.getElementById("heicInput");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadJPG");
const dropArea = document.getElementById("dropArea");

let selectedFile = null;

/* klik upload */
dropArea.onclick = () => input.click();

/* pilih file */
input.addEventListener("change", function(){

selectedFile = this.files[0];

if(selectedFile){
preview.src = URL.createObjectURL(selectedFile);
preview.style.display = "block";
}

});


/* convert */
async function convertHEIC(){

if(!selectedFile){
alert("Upload file dulu");
return;
}

try{

const blob = await heic2any({
blob: selectedFile,
toType: "image/jpeg",
quality: 0.9
});

const url = URL.createObjectURL(blob);

preview.src = url;

downloadBtn.href = url;
downloadBtn.download = "hasil.jpg";
downloadBtn.style.display = "block";

}catch(e){

alert("Gagal convert file");

}

}