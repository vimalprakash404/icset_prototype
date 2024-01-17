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
const { Groups } = require("../../models/group")
const db = require("../../db/connection")
const workshop_model = require("../../models/workshop")
function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

async function checkEventIdExists(id) {
    try {
        if (isValidObjectId(id)) {
            const workshop = await Event_model.findById(id);
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
            if (await particiapant_model.findOne({ "email": value }) !== null) {
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


const group_checker = async (value, { req }) => {
    const event = req.body.event
    if (await Event_model.findOne({ "_id": event }) !== null) {
        if ((await checkCollectionExists("group_" + event)) || (await checkCollectionExists("group_" + event+"s"))) {
            if (await Groups("group_" + event).findOne({ "_id": value }) === null) {
                throw new Error("invalid group id")
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


const workshop_checker = async (value, { req }) => {
    const event = req.body.event
    const mkdata = require("./states.json")
    if (await Event_model.findOne({ "_id": event }) !== null) {
        if ((await checkCollectionExists("particpants_" + event))||(await checkCollectionExists("particpants_" + event+"s"))) {
            const workshop_data = await workshop_model.find({ "event": event })
            if (workshop_data == []) {
                throw new Error("workshop has not value")
            }
            else {
                var data_bool = false
                if (typeof value === "object") {
                    Object.keys(value).forEach((element) => {
                        if (workshop_data.some(data => data.title === element)) {
                            data_bool = true
                            console.log(data_bool)
                        }
                        else {
                            throw new Error("workshop not found")
                        }
                    })
                }
                else {
                    throw new Error("workshop not object")
                }
                console.log("dsddd" + data_bool)
                return data_bool
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

function isMongoId(str) {
 
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(str);
  }

const workshop_c = async (value,{req}) =>{
    var bool_val = false ;
    var worshop_data = {}
   for (let i = 0 ; i< value.length;i++)
    {
        var element = value[i]
        if(isMongoId(element)){
            if (await workshop_model.findOne({"_id":element,event : req.body.event})!== null)
            {
                console.log(element)
                bool_val = true ;
                
            }
            else{
                console.log("false :"+element)
                bool_val = false ;
                break
            }
        }
        else{
            console.log("false :"+element)
            bool_val = false ;
            break
        }
    }
    
    if (bool_val == false){
        throw new Error("invalid workshop id ")
    }
    else {
        req.body.workshops= worshop_data
        return true 
    }
}

const state_checker = async (value) => {
    if (!require("./states.json")["states"].some(data => data.state === value)) {
        throw new Error("state not found")
    }
    else
        return true
}

const district_checker = async (value, { req }) => {
    if (await state_checker(req.body.state) === true) {
        const data = require("./states.json")["states"].find(sample => sample.state === req.body.state)
        if (data.districts.some(element => element === value))
            return true
        else
            throw new Error("distric not found")
    }
    else {
        throw new Error("state not found")
    }
}
const gender_checker = (value) =>{
    if (! (value === "male" || value === "female" || value === "other")){
            throw new Error("gender value is not valid please enter male , female or other")
    }
    else {
        return true
    }
}


const form_validator = [
    body("event").isMongoId(),
    body("name").isString(),
    body("email").isEmail().custom(email_checker),
    body("mobile").isMobilePhone(),
    body("group").isMongoId().custom(group_checker),
    body("workshops").isArray().custom(workshop_c),
    body("state").isString().custom(state_checker),
    body("district").isString().custom(district_checker),
    body("gender").isString().custom(gender_checker)
]



router.post("/add", form_validator, async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({ "errors": errors.array() })
        }
        else {
            const particiapant_model = Participants_Dynamic("particpants_" + req.body.event)
            var workshop_data ={}
            for (let i =0 ; i< req.body.workshops.length;i++)
            {
                workshop_data[(await workshop_model.findOne({"_id":req.body.workshops[i],event : req.body.event}))["title"]] = 1 ;
            }
            req.body.workshops=workshop_data;
            console.log(req.body.workshops)
            const model = new particiapant_model(req.body)
            model.save()
            return res.status(200).send({ "data": "saved" })
        }
    }
    catch (error) {
        res.status.json({ error })
    }
})

router.post("/add1", async (req, res) => {
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
