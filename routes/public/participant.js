const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const readLine = require("readline")
// const { check, validationResult } = require("express-validator");
const { Participants_Dynamic } = require("../../models/particpants")

const Event_model = require("../../models/event")
router.post("/add", async (req, res) => {
    const { name, mobile, email, event } = req.body;

    async function documentExist(objectId) {
        try {
            const result = await Event_model.findById(objectId)
            console.log(!!result)
            return !!result;
        }
        catch (err) {
            return false;
        }
    }
    function isEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    if (!email) {
        res.status(422).json({ validation: false, message: "please enter email" })


    }
    else {
        if (!isEmail(email)) {
            res.status(422).json({ validation: false, message: "plaese enter the valid email" })
        }
    }
    function isMobileNumber(str) {
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(str)
    }
    if (!mobile) {
        res.status(422).json({ validation: false, message: "please enter the mobile number" })
    }
    else {
        if (!isMobileNumber(mobile)) {
            res.status(422).json({ validation: false, message: "please enter the valid mobile number" })
        }
    }
    function isName(str) {
        const nameRegex = /^[A-Za-z\s]+$/;
        return nameRegex.test(str)
    }
    if (!name) {
        res.status(422).json({ validation: false, message: "please enter the name " })
    }
    else {
        if (!isName(name)) {
            res.status(422).json({ validation: false, message: "enter valid name" })
        }
    }
    function isObjectId(str) {
        // MongoDB ObjectId is a 24-character hexadecimal string
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;

        return objectIdRegex.test(str);
    }
    if (!event) {
        console.log(event)
        return res.status(422).json({ validation: false, message: "event id not found" })
    }
    else {
        if (!isObjectId(event))
            return res.status(422).json({ validation: false, message: "this is not valid event email id" })
        if (!await documentExist(event)) {
            return res.status(422).json({ validation: false, message: "cannot find event with this object id" })
        }
    }

    add_participants(res, name, mobile, email, event);
    // return res.status(200).json({ name, mobile, email, event })
});

async function add_participants(res, name, mobile, email, event) {
    const modelName = "particpants_" + event;
    const event_ob = await Event_model.findById(event).exec();
    let Schema_data_ob = {};
    for (let i = 0; i < event_ob.workshops.length; i++) {
        let key = event_ob.workshops[i]; // Replace event_object.workshops[i] with your actual key
        let data = { [key]: { type: "Number", default: "0" } };
        Schema_data_ob = { ...Schema_data_ob, ...data };
    }
    const newGroupdata = Participants_Dynamic(modelName, Schema_data_ob);
    const dataExist = await newGroupdata.findOne({ mobile: mobile, event })
    if (dataExist) {
        return res.status(200).json({ message: "mobile duplication not allowed" })
    }
    const emailExist = await newGroupdata.findOne({ email: email, event })

    if (emailExist) {
        return res.status(200).json({ message: "email duplication not allowed" })
    }
    else {
        
        let workshops  = {}
        event_ob.workshops.forEach((element) => {

            workshops = {...workshops,...{[element]:0}}
        })
        console.log(workshops);
        const data = {
            name : name,
            email : email,
            mobile : mobile ,
            event : event,
            workshops : workshops
        }
        const Participants_Model =  Participants_Dynamic(modelName);
        const model =new  Participants_Model(data);
        model.save();
        res.status(200).json({"message": "sample"})
    }
}
async function getAllUser() {

}
router.get("/get/:event", async (req, res) => {
    const  event  = req.params.event;
    console.log(event);
    try {
        const modelName = "particpants_" + event;
        const newModel = Participants_Dynamic(modelName);
        const data = await newModel.find();
        return res.status(200).json(data);
    }
    catch (err) {
        return res.status(400).json(err)
    }
})

router.get("/get/user/:event/:userid", async (req, res) => {
    const user = req.params.userid;
    const event = req.params.event;
    const modelName = "particpants_" + event;
    const newModel = Participants_Dynamic(modelName);
    const data = await newModel.find({event : event, _id : user } );
    return res.status(200).json({data})

})

module.exports = router;
