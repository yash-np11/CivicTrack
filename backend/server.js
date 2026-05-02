const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const multer = require("multer");
const path = require("path");

const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({

destination: function(req, file, cb){
cb(null, "uploads/");
},

filename: function(req, file, cb){
cb(null, Date.now() + path.extname(file.originalname));
}

});

const upload = multer({ storage: storage });



function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch {
    res.status(400).send("Invalid Token");
  }
}


// ✅ Model import (UPPER SIDE)
const Complaint = require("./models/Complaint");

// 🔥 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((err) => {
    console.log("FULL ERROR", err);
});

// ✅ Test route
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});

app.get("/test", (req, res) => {
    res.json({ message: "API is working 🚀" });
});

// ✅ IMPORTANT API (yahi main kaam hai)
app.post("/add-complaint", upload.single("image"), async(req,res)=>{

try{

const newComplaint = new Complaint({

title:req.body.title,

description:req.body.description,

location:req.body.location,

image:req.file ? req.file.filename : "",

leaderName: "Mr. Rahul Sharma",
leaderArea: "Nagpur Ward 12",
deadLine: new Date(Date.now()+7*24*60*60*1000).toDateString()

});

await newComplaint.save();

res.send("Complaint Registered ✅");

}catch(err){

console.log(err);

res.status(500).send("Error");

}

});
app.post("/signup", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = new User({
        email: req.body.email,
        password: hashedPassword
    });

    await user.save();

    res.send("User created ✅");
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.send("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.send("Wrong password");

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token });
});





app.get("/complaints", auth, async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.json(complaints);
    } catch (err) {
        res.status(500).send(err);
    }
});



app.put("/update-status/:id", async (req, res) => {
    try {
        await Complaint.findByIdAndUpdate(req.params.id, {
            status: "Resolved"
        });

        res.send("Status Updated ✅");
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete("/delete-complaint/:id", async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.send("Deleted ✅");
    } catch (err) {
        res.status(500).send(err);
    }
});



// ✅ ALWAYS LAST
app.listen(5000, () => {
    console.log("Server started on port 5000");
});

