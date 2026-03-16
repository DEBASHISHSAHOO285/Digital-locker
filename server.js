const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET = "digitalLockerSecret";

/* ======================
   MongoDB
====================== */

mongoose.connect("mongodb+srv://debashish:Dev1100@cluster0.oxjeojr.mongodb.net/digitalLocker")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("MongoDB Error:",err));


/* ======================
   Schemas
====================== */

const documentSchema = new mongoose.Schema({
name:String,
filename:String,
category:String,
driveLink:String,
uploadDate:{
type:Date,
default:Date.now
}
});

const userSchema = new mongoose.Schema({
email:String,
password:String,
biometricId:String
});

const Document = mongoose.model("Document",documentSchema);
const User = mongoose.model("User",userSchema);


/* ======================
   Auth Middleware
====================== */

function verifyToken(req,res,next){

const token = req.headers["authorization"];

if(!token){
return res.status(401).json({message:"Unauthorized"});
}

try{

const decoded = jwt.verify(token,SECRET);
req.user = decoded;
next();

}catch(err){

res.status(401).json({message:"Invalid token"});

}

}


/* ======================
   Static Files
====================== */

app.use(express.static(__dirname));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));


/* ======================
   Multer Storage
====================== */

const storage = multer.diskStorage({

destination:(req,file,cb)=>{

const category = req.params.category;

const dir = path.join(__dirname,"uploads",category);

if(!fs.existsSync(dir)){
fs.mkdirSync(dir,{recursive:true});
}

cb(null,dir);

},

filename:(req,file,cb)=>{

const ext = path.extname(file.originalname);
cb(null,Date.now()+ext);

}

});

const upload = multer({storage});


/* ======================
   Upload Document
====================== */

app.post("/upload/:category",verifyToken,upload.single("file"),async(req,res)=>{

try{

const doc = new Document({
name:req.body.name,
filename:req.file.filename,
category:req.params.category,
driveLink:req.body.driveLink
});

await doc.save();

res.json({message:"Document uploaded"});

}catch(err){

res.status(500).json({message:"Upload error"});

}

});


/* ======================
   Get Documents
====================== */

app.get("/documents/:category",verifyToken,async(req,res)=>{

try{

const docs = await Document.find({
category:req.params.category
});

res.json(docs);

}catch(err){

res.json([]);

}

});


/* ======================
   Delete Document
====================== */

app.delete("/delete/:id",verifyToken,async(req,res)=>{

try{

const doc = await Document.findById(req.params.id);

if(!doc){
return res.json({message:"Document not found"});
}

const filePath = path.join(__dirname,"uploads",doc.category,doc.filename);

if(fs.existsSync(filePath)){
fs.unlinkSync(filePath);
}

await Document.findByIdAndDelete(req.params.id);

res.json({message:"Deleted"});

}catch(err){

res.json({message:"Delete error"});

}

});


/* ======================
   Download File
====================== */

app.get("/download/:category/:file",(req,res)=>{

const filePath = path.join(__dirname,"uploads",req.params.category,req.params.file);

res.download(filePath);

});


/* ======================
   Signup
====================== */

app.post("/signup",async(req,res)=>{

try{

const {email,password} = req.body;

const hashedPassword = await bcrypt.hash(password,10);

const user = new User({
email,
password:hashedPassword
});

await user.save();

res.json({message:"User created"});

}catch(err){

res.status(500).json({message:"Signup error"});

}

});


/* ======================
   Login
====================== */

app.post("/login",async(req,res)=>{

try{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.json({message:"User not found"});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.json({message:"Wrong password"});
}

const token = jwt.sign({id:user._id},SECRET);

res.json({
message:"Login success",
token:token
});

}catch(err){

res.status(500).json({message:"Login error"});

}

});


/* ======================
   Default Route
====================== */

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"login.html"));
});


/* ======================
   Start Server
====================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
console.log("Server running on port "+PORT);
});