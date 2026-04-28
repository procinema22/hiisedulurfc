const dropArea = document.getElementById("dropArea")
const input = document.getElementById("fileInput")

const previewList = document.getElementById("previewList")
const convertBtn = document.getElementById("convertBtn")
const progressBar = document.getElementById("progressBar")
const downloadAll = document.getElementById("downloadAll")

let files=[]
let results=[]


dropArea.onclick=()=>input.click()


input.addEventListener("change",e=>{
handleFiles([...e.target.files])
})


dropArea.addEventListener("dragover",e=>{
e.preventDefault()
})


dropArea.addEventListener("drop",e=>{
e.preventDefault()

handleFiles([...e.dataTransfer.files])

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



convertBtn.onclick=async()=>{

results=[]

for(let i=0;i<files.length;i++){

const blob=await heic2any({
blob:files[i],
toType:"image/jpeg",
quality:0.9
})

results.push(blob)

let percent=((i+1)/files.length)*100

progressBar.style.width=percent+"%"

}

alert("Convert selesai")

}



downloadAll.onclick=()=>{

results.forEach((blob,i)=>{

const url=URL.createObjectURL(blob)

const a=document.createElement("a")

a.href=url
a.download="image_"+(i+1)+".jpg"

a.click()

})

}