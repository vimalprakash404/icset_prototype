const express = require("express");
const jwt = require('jsonwebtoken');
const router  = express.Router();

router.post("/login",(req, res)=>{
    const name = req.body
    return res.status(200).json({message :  "login post", name})
})

module.exports = router ;