const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const readLine = require("readline")
const { body, validationResult } = require("express-validator")
// const { check, validationResult } = require("express-validator");
const { Participants_Dynamic } = require("../../models/particpants")

const Event_model = require("../../models/event")
const Group_model = require("../../models/group");
const { BSONSymbol } = require("mongodb");
const { log } = require("console");
const {Groups} = require("../../models/group")
const db = require("../../db/connection")
const workshop_model = require("../../models/workshop")
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function checkEventIdExists(id) {
    try {
        if (isValidObjectId(id)) {
            const workshop = await Event_model.findById(id);
            console.log("dataijaiajai" + !!workshop)
            return !!workshop; // Returns true if the workshop is found, false otherwise
        }
        else {
            console.log("is not valid")
            return false
        }
    } catch (error) {
        console.error("Error checking workshop existence:", error.message);
        return false;
    }
}

function checkCollectionExists(collectionName) {
    return db.connection.db.listCollections({ name: collectionName }).next((err, collinfo) => {
      if (err) {
        console.error(`Error checking collection: ${err}`);
        return false;
      }
      else {
        return true;
      }
    });
  }
  


const event_checker = async (value) => {
    if ((await Event_model.findOne({ "_id": value })) === null) {
        throw new Error("event id not exist")
    }
    else {
        return true
    }
}

const email_checker = async (value, { req, res }) => {
    const event = req.body.event
    if ((await Event_model.findOne({ "_id": event })) !== null) {
        {
            const particiapant_model = Participants_Dynamic("particpants_" + event);
            if (await particiapant_model.findOne({"email": value}) !== null) {
                throw new Error("email already exist")
            }
            else {
                return true
            }
        }
    }
    else {
        throw new Error("event not exist")
    }
}


const group_checker = async (value , {req}) => {
    const event = req.body.event
    if (await Event_model.findOne({"_id" : event}) !== null){
        if (await checkCollectionExists("group_"+event)){
            console.log()
            if (await Groups("group_"+event).findOne({"_id":value}) === null){
                throw new Error ("invalid group id")
            }
            else {
                return true
            }
        }
        else {
            throw new Error("group not exists")
        }
    }
    else {
        throw new Error("event not exists")
    }
}


const workshop_checker = async (value, {req}) => { 
    const event = req.body.event
    const mkdata = require("./states.json")
    if (await Event_model.findOne({"_id" : event}) !== null){
        if (await checkCollectionExists("particpants_"+event)){
            const workshop_data = await workshop_model.find({"event" : event})
            if (workshop_data == []){
                throw new Error("workshop has not value")
            }
            else {
                value.forEach((element) => {
                    if (typeof element !== 'object'){
                        throw new Error(element+" has not value")
                    }
                    else {
                        const arr =Object.keys(element)
                        if(arr.length=== 1){
                            console.log(arr[0])
                            if (workshop_data.some(data => data.title === arr[0])){
                                if (element[arr[0]] === 0 || element[arr[0]] === 1 || element[arr[0]] ===2){
                                    console.log("good")

                                }
                                else {
                                    throw new Error(Object.keys(element)[0]+" enter valid value")
                                }
                            }
                            else {
                                throw new Error(Object.keys(element)[0]+" wokshop not found")
                            }
                        }
                        else {
                            throw new Error(element+" should only one key")
                        }
                    }
                })
            }
        }
        else {
            throw new Error("event not participant table not found")
        }
    }
    else {
        throw new Error("event not exists")
    }
}



const form_validator = [
    body("event").isMongoId(),
    body("name").isString(),
    body("email").isEmail().custom(email_checker),
    body("phone").isMobilePhone(),
    body("group").isMongoId().custom(group_checker),
    body("workshop").isArray().custom(workshop_checker)
]



router.post("/adder", form_validator, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({ "errors": errors.array() })
    }
    else {
        return res.status(200).send({ "data": "good" })
    }
})

router.post("/add", async (req, res) => {
    const { name, mobile, email, event, group } = req.body;

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

    add_participants(res, name, mobile, email, event, group);
    // return res.status(200).json({ name, mobile, email, event })
});

async function add_participants(res, name, mobile, email, event, group) {
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

        let workshops = {}
        event_ob.workshops.forEach((element) => {

            workshops = { ...workshops, ...{ [element]: 0 } }
        })
        console.log(workshops);
        const data = {
            name: name,
            email: email,
            mobile: mobile,
            event: event,
            workshops: workshops,
            group: group
        }
        const Participants_Model = Participants_Dynamic(modelName);
        const model = new Participants_Model(data);
        console.log(model);
        model.save();
        res.status(200).json({ "message": "sample" })
    }
}

router.get("/get/:event", async (req, res) => {
    const event = req.params.event;

    console.log(event);
    try {
        console.log("return", await checkEventIdExists(event))
        if (! await checkEventIdExists(event)) {
            const message = "not valid event id"
            return res.status(400).json({ message })
        }
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
    if (! await checkEventIdExists(event)) {
        const message = "not valid event id"
        return res.status(400).json({ message })
    }
    const modelName = "particpants_" + event;
    const newModel = Participants_Dynamic(modelName);
    const data = await newModel.find({ event: event, _id: user });
    return res.status(200).json({ data })

})




module.exports = router;
