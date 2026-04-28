async function convertHEIC(){

    const input = document.getElementById("heicInput");
    const file = input.files[0];
    
    if(!file){
    alert("Pilih file HEIC dulu");
    return;
    }
    
    try{
    
    const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9
    });
    
    const url = URL.createObjectURL(result);
    
    const link = document.getElementById("downloadJPG");
    link.href = url;
    link.download = "hasil.jpg";
    link.style.display = "inline";
    link.innerText = "Download JPG";
    
    }catch(err){
    
    alert("Gagal convert");
    
    }
    
    }