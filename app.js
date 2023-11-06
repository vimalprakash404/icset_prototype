const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const authRoutes = require("./routes/users")
const sample = require("./routes/host/sample")
// import host functions
const host = require("./routes/host/host")


require('dotenv').config();
const port = process.env.PORT || 3000; 
const app = express();
app.use(express.json());
//database 
mongoose.connect(process.env.MONGODB_URI);
// adding routes
app.use('/auth',authRoutes);
 app.use("/host",host)
app.get("/",(req, res)=>{
    return res.send("hello");
})

app.get("/host",)
app.use("/sample",sample);
app.listen(port,()=>{
    console.log("app is running on "+port);
})