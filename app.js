const express = require('express');
const cors = require('cors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const authRoutes = require("./routes/users")
const sample = require("./routes/host/sample")
const public = require("./routes/public/public")
// const user = require("./routes/users")
// import host functions
const host = require("./routes/host/host");
const volunteer = require("./routes/public/volunter")

// const { default: mongoose } = require('mongoose');
const  register = require("./routes/authentication/register")


require('dotenv').config();
const mongoose = require("./db/connection")
const port = process.env.PORT || 3000; 
const app = express();
app.use(express.json());
app.use(cors());
//database 
// mongoose.connect(process.env.MONGODB_URI);
// adding routes
app.use('/auth',authRoutes);
app.use("/host",host);
app.use("/",public);

app.use("/volunter",volunteer);
app.get("/",(req, res)=>{
    return res.send("hello");
})
app.use("/sample",sample);
app.listen(port,'0.0.0.0',()=>{
    console.log("app is running on "+port);
})