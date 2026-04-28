const dropArea = document.getElementById("dropArea")
const input = document.getElementById("fileInput")

const previewList = document.getElementById("previewList")
const convertBtn = document.getElementById("convertBtn")
const progressBar = document.getElementById("progressBar")
const downloadAll = document.getElementById("downloadAll")

let files = []
let results = []

/* klik upload */

dropArea.onclick = () => input.click()

/* drag drop */

dropArea.addEventListener("dragover", e=>{
e.preventDefault()
})

dropArea.addEventListener("drop", e=>{
e.preventDefault()

const dropped = [...e.dataTransfer.files]

handleFiles(dropped)
})

/* pilih file */

input.addEventListener("change", e=>{
handleFiles([...e.target.files])
})


function handleFiles(selected){

selected.forEach(file=>{

if(!file.name.toLowerCase().endsWith("heic")) return

files.push(file)

const url = URL.createObjectURL(file)

const div = document.createElement("div")
div.className="preview-item"

div.innerHTML=`
<img src="${url}">
<p>${file.name}</p>
`

previewList.appendChild(div)

})

}


/* convert semua */

convertBtn.onclick = async ()=>{

results=[]

for(let i=0;i<files.length;i++){

const file = files[i]

const blob = await heic2any({
blob:file,
toType:"image/jpeg",
quality:0.9
})

results.push(blob)

let percent = ((i+1)/files.length)*100
progressBar.style.width = percent+"%"

}

alert("Convert selesai")

}


/* download semua */

downloadAll.onclick=()=>{

results.forEach((blob,i)=>{

const url = URL.createObjectURL(blob)

const a=document.createElement("a")

a.href=url
a.download="image_"+i+".jpg"

a.click()

})

}