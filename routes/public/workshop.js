const express = require('express')
const router = express.Router();
const workshop_model = require("../../models/workshop")
const moongoose = require("mongoose")

router.get("/get/:event",async (req , res) => {
    try{
        const event = req.params.event;
    // const data_model = new workshop_model();
    const data =await workshop_model.find({event : event});
    return res.status(200).json(data);
    }
    catch(error)
    {
        return res.status(500).json(error);
    }
})


router.post("/verify", async (req , res) => {
    const {event,userId} = req.body;
    res.status(200).json({"message" : event , userId })
})

module.exports = router;