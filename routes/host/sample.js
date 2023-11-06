const express = require("express");
const router = express.Router();
const data = require("../../middleware/auth")
router.get("/sample",data, async (req, res)=> {
    res.json({message : "message is protected"})
});

module.exports = router 