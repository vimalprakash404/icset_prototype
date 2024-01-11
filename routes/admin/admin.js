const express = require('express')
const router = express.Router()
const Event = require("../../models/event")  
router.post("/approve/:eventId",async(req , res)=>{
    const data = req.params.eventId
    const res_data = await Event.findByIdAndUpdate({"_id":data},{"approve": true})
    if (res_data !== null){
        return res.status(200).json({"message":"data updated"})
    }
    else{
        return res.status(404).json({"message":"event not found"})
    }
})

module.exports = router