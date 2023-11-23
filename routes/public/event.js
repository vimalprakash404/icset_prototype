const express = require('express')
const router = express.Router();
const event_model = require("../../models/event")

router.get("/get/:event",async (req, res)=>{
    const event = req.params.event
    const event_ob = new event_model();
    const data =await event_model.find({_id : event})
    return res.status(200).json(data)
})
module.exports = router ;