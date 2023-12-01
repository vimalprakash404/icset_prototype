const express = require('express');
const router = express.Router();

router.post("/host",async ( req, res) => {
    const {username, email }= req.body;

    return res.status(200).json({username,email})
})

module.exports = router ;