const dropArea = document.getElementById("dropArea")
const input = document.getElementById("fileInput")

const previewList = document.getElementById("previewList")
const convertBtn = document.getElementById("convertBtn")
const progressBar = document.getElementById("progressBar")
const downloadAll = document.getElementById("downloadAll")

let files = []
let results = []


/* klik upload */
dropArea.addEventListener("click",()=>{
input.click()
})


/* drag over */
dropArea.addEventListener("dragover",e=>{
e.preventDefault()
dropArea.style.borderColor="#22c55e"
})


/* drag leave */
dropArea.addEventListener("dragleave",()=>{
dropArea.style.borderColor="#3b82f6"
})


/* drop file */
dropArea.addEventListener("drop",e=>{
e.preventDefault()

const dropped=[...e.dataTransfer.files]

handleFiles(dropped)
})


/* pilih file */
input.addEventListener("change",e=>{
handleFiles([...e.target.files])
})


function handleFiles(selected){

selected.forEach(file=>{

files.push(file)

const div=document.createElement("div")
div.className="preview-item"

div.innerHTML=`
<p>${file.name}</p>
`

previewList.appendChild(div)

})

}


/* convert semua */
convertBtn.addEventListener("click",async()=>{

if(files.length===0){
alert("Upload file dulu")
return
}

results=[]

for(let i=0;i<files.length;i++){

const file=files[i]

const blob=await heic2any({
blob:file,
toType:"image/jpeg",
quality:0.9
})

results.push(blob)

let percent=((i+1)/files.length)*100
progressBar.style.width=percent+"%"

}

alert("Convert selesai")

})


/* download semua */
downloadAll.addEventListener("click",()=>{

if(results.length===0){
alert("Convert dulu")
return
}

results.forEach((blob,i)=>{

const url=URL.createObjectURL(blob)

const a=document.createElement("a")

a.href=url
a.download="image_"+(i+1)+".jpg"

a.click()

})

})