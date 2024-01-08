const express = require("express") 
const router = express.Router()
const mongoose = require("mongoose")
const event_model = require("../../models/event")
const workshop_model = require("../../models/workshop")
const {Groups} = require("../../models/group")
router.get("/field/:eventid" , async (req , res ) => {
    const event_id= req.params.eventid
    const event_data = await event_model.findOne({_id : event_id})
    if (event_data == null ){
        return res.status(404).json({"message": "event not found"})
    }
    else {
        const group_model =await Groups("group_"+event_id);
        const data =await group_model.find({})
        console.log(data)
        const workshop_data = await  workshop_model.find({event : event_data})
        const fields = [
            {
                label : "Name" ,
                type : "text" ,
                require : true ,
                name : "name" 
            },
            {
                label : "Email" ,
                type : "email" ,
                require : true ,
                name : "email"
            },
            {
                label : "Phone " ,
                type : "email" ,
                require : true ,
                name : "mobile"
            },
            {
                label : "Group" ,
                type : "dropdown" ,
                require :  true ,
                value : data
            },
            {
                label : "workshops" ,
                type : "card" ,
                require :true ,
                value : workshop_data
            }
        ]
        await  workshop_model.find({event : event_data})
        return res.status(200).send({fields})
    }
})

module.exports = router;