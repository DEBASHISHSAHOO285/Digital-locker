/* Check biometric support */

if (window.PublicKeyCredential) {
    console.log("Biometric supported in this device");
} else {
    console.log("Biometric not supported");
}

let currentSection = "";

/* Login Protection */

if (!localStorage.getItem("token") && window.location.pathname.includes("index.html")) {
    window.location = "login.html";
}

/* Open Section */

function openSection(section) {

    currentSection = section;

    document.querySelector(".dashboard").style.display = "none";
    document.getElementById("sectionPage").style.display = "block";

    document.getElementById("sectionTitle").innerText = section.toUpperCase();

    loadFiles();
}

/* Back Button */

function goBack() {

    document.querySelector(".dashboard").style.display = "grid";
    document.getElementById("sectionPage").style.display = "none";

}

/* Popup */

function openPopup() {
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

/* Load Documents */

async function loadFiles(){

try{

const token = localStorage.getItem("token");

const response = await fetch("/documents/" + currentSection, {

method: "GET",

headers:{
"Authorization": token
}

});

const files = await response.json();

if(!Array.isArray(files)){
console.log("Invalid response:", files);
return;
}

const list = document.getElementById("documentList");

list.innerHTML = "";

files.forEach(doc => {

const box = document.createElement("div");

box.style.display = "flex";
box.style.justifyContent = "space-between";
box.style.alignItems = "center";

box.style.background = "rgba(255,255,255,0.15)";
box.style.padding = "12px 18px";
box.style.margin = "10px";
box.style.borderRadius = "10px";
box.style.boxShadow = "0 5px 10px rgba(0,0,0,0.3)";

/* File icon + name */

const fileInfo = document.createElement("div");

fileInfo.style.display = "flex";
fileInfo.style.alignItems = "center";
fileInfo.style.gap = "10px";

const icon = document.createElement("i");

icon.className = "fa-solid fa-file";
icon.style.color = "#00ff9d";

const fileName = document.createElement("a");

fileName.href = "/uploads/" + doc.category + "/" + doc.filename;
fileName.innerText = doc.name;
fileName.target = "_blank";

fileName.style.color = "white";
fileName.style.textDecoration = "none";

fileInfo.appendChild(icon);
fileInfo.appendChild(fileName);

/* Preview Button */

const previewBtn = document.createElement("button");

previewBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';

previewBtn.style.background = "#3498db";
previewBtn.style.padding = "7px 10px";
previewBtn.style.borderRadius = "6px";
previewBtn.style.border = "none";
previewBtn.style.color = "white";
previewBtn.style.cursor = "pointer";

previewBtn.onclick = () => {

const fileUrl = "/uploads/" + doc.category + "/" + doc.filename;
window.open(fileUrl, "_blank");

};

/* Download Button */

const downloadBtn = document.createElement("a");

downloadBtn.href = "/download/" + doc.category + "/" + doc.filename;

downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i>';

downloadBtn.style.background = "#00ff9d";
downloadBtn.style.padding = "7px 10px";
downloadBtn.style.borderRadius = "6px";
downloadBtn.style.textDecoration = "none";
downloadBtn.style.color = "black";

/* Delete Button */

const deleteBtn = document.createElement("button");

deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';

deleteBtn.style.background = "#ff4d4d";
deleteBtn.style.border = "none";
deleteBtn.style.color = "white";
deleteBtn.style.padding = "7px 10px";
deleteBtn.style.borderRadius = "6px";
deleteBtn.style.cursor = "pointer";

deleteBtn.onclick = async () => {

const token = localStorage.getItem("token");

await fetch("/delete/" + doc._id, {
method:"DELETE",
headers:{
"Authorization": token
}
});

loadFiles();

};

/* Action Buttons */

const actions = document.createElement("div");

actions.style.display = "flex";
actions.style.gap = "10px";

actions.appendChild(previewBtn);
actions.appendChild(downloadBtn);
actions.appendChild(deleteBtn);

box.appendChild(fileInfo);
box.appendChild(actions);

list.appendChild(box);

});

}catch(error){

console.log(error);
alert("Error loading documents");

}

}

/* Upload Document */

async function saveDoc() {

const name = document.getElementById("docName").value;
const file = document.getElementById("docFile").files[0];
const driveLink = document.getElementById("driveLink").value;

if (!file) {
alert("Please select a file");
return;
}

const formData = new FormData();

formData.append("name", name);
formData.append("file", file);
formData.append("driveLink", driveLink);

const token = localStorage.getItem("token");

try {

const response = await fetch("/upload/" + currentSection, {

method: "POST",

headers:{
"Authorization": token
},

body: formData

});

const data = await response.json();

alert(data.message);

closePopup();
loadFiles();

} catch (error) {

console.log(error);
alert("Upload failed");

}

}

/* Logout */

function logout(){

localStorage.removeItem("token");
window.location = "index.html";

}

/* Biometric Login */

async function biometricLogin(){

if(!window.PublicKeyCredential){
alert("Biometric not supported on this device");
return;
}

try{

const credential = await navigator.credentials.get({
publicKey:{
challenge:new Uint8Array(32),
timeout:60000,
userVerification:"preferred"
}
});

if(credential){

localStorage.setItem("token","biometric-login");
window.location="index.html";

}

}catch(err){

console.log(err);
alert("Biometric authentication failed");

}

}

const userEmail = localStorage.getItem("userEmail");

if(userEmail){
    document.addEventListener("DOMContentLoaded", ()=>{
        const el = document.getElementById("welcomeUser");
        if(el){
            el.innerText = "Welcome, " + userEmail;
        }
    });
}
document.querySelectorAll(".card").forEach(card => {

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 10;
    const rotateY = (x - centerX) / 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0) rotateY(0)";
  });

});