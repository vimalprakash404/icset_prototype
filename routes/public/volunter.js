const express = require("express")
const router = express.Router();

router.post("/verify", (req,res) => {
    const {event , workshop , userid} = req.body ; 
    res.status(400).send({message :"", event, workshop})
});


module.exports = router