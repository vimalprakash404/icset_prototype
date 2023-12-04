const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const { Participants_Dynamic } = require("../../models/particpants");
const dbconnnection = require("../../db/connection")
const { Groups } = require("../../models/group")
const workshop_model = require("../../models/workshop");
const { isVolunter } = require("../../middleware/volunteer");
const auth = require("../../middleware/auth")
const { create_model, insert_model } = require("../../controller/logcontroller");
const { verify } = require("jsonwebtoken");

function checkEmailOrPhone(input) {
    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Regular expression for phone number validation (assuming a simple format)
    const phoneRegex = /^\d{10}$/;

    if (emailRegex.test(input)) {
        return 'Email';
    } else if (phoneRegex.test(input)) {
        return 'Phone';
    } else {
        return 'Invalid';
    }
}


router.post("/verify", auth, isVolunter, async (req, res) => {
    const { workshop, userid, eventid } = req.body;
    try {
        if (!workshop) {
            return res.status(200).send({ "message": "please enter the workshop data", "validation": false })
        }
        else if (!userid) {
            return res.status(200).send({ "message": "please the userid ", 'validation': false });
        }
        else if (!eventid) {
            return res.status(200).send({ "message": "plesae the eventid", "validation": false });
        }

        const model_name = "particpants_" + eventid;
        console.log(model_name);
        const particpants_model = Participants_Dynamic(model_name);
        const data = await particpants_model.findOne({ event: eventid, _id: userid });

        if (data.workshops[workshop] === 0) {
            return res.status(200).json({ "verification": false, "message": "not register for work shop" })
        }
        else if (data.workshops[workshop] === 2) {
            return res.status(200).json({ "verification": false, "message": "verified" })
        }
        data.workshops[workshop] = 2;
        const currentTimeseries = new Date();
        data.time = Object.assign({ [workshop]: currentTimeseries }, data.time);
        await data.save();

        await particpants_model.updateOne({ event: eventid, _id: userid }, data)
        return res.status(200).json({ "verification": true })
    }
    catch (err) {
        return res.status(200).json({ "verification": false, "error": err })
    }

});

router.post("/sync", async (req, res) => {
    console.log("datalll");
    const { data, event } = req.body;
    const model_name = "particpants_" + event;
    const particpants_model = Participants_Dynamic(model_name);
    try {
        for (let i = 0; i < data.length; i++) {
            console.log("ggggg")
            let data_value = await particpants_model.findOne({ event: event, _id: data[i].id });
            data_value.workshops[data[i].workshop] = 2;
            data_value.save();
            await particpants_model.updateOne({ event: event, _id: data[i].id }, data_value);
            console.log("saved");
        }
        return res.status(200).json({"message":"saved"})
    }
    catch (err) {
        return res.status(200).json({"message":"unsaved"})
    }

});

router.post("/unverify", auth, isVolunter, async (req, res) => {
    const { workshop, userid, eventid } = req.body;
    try {
        if (!workshop) {
            return res.status(200).send({ "message": "please enter the workshop data", "validation": false })
        }
        else if (!userid) {
            return res.status(200).send({ "message": "please the userid ", 'validation': false });
        }
        else if (!eventid) {
            return res.status(200).send({ "message": "plesae the eventid", "validation": false });
        }

        const model_name = "particpants_" + eventid;
        console.log(model_name);
        const particpants_model = Participants_Dynamic(model_name);
        const data = await particpants_model.findOne({ event: eventid, _id: userid });

        if (data.workshops[workshop] === 0) {
            return res.status(200).json({ "verification": false, "message": "not register for work shop" })
        }
        else if (data.workshops[workshop] === 1) {
            return res.status(200).json({ "verification": false, "message": "not verified" })
        }
        data.workshops[workshop] = 1;
        await data.save();
        await particpants_model.updateOne({ event: eventid, _id: userid }, data)
        return res.status(200).json({ "verification": true })
    }
    catch (err) {
        return res.status(200).json({ "verification": false, "error": err })
    }

});

router.get("/search/:eventid/:input", async (req, res) => {
    const input = req.params.input;
    const event_id = req.params.eventid;
    console.log(event_id);
    const data_input = checkEmailOrPhone(input)
    create_model(event_id);
    insert_model(event_id, "verified", "656d64b2eb4f42945487e4f6", "google", "656b4daa6f69d44f15e6ca4e")
    if (data_input == "Phone") {
        const model_name = "particpants_" + event_id;
        const particpants_model = Participants_Dynamic(model_name);
        const data = await particpants_model.find({ "mobile": input });
        return res.status(200).json({ data, invalid: false })
    }
    else if (data_input == "Email") {
        const model_name = "particpants_" + event_id;
        const particpants_model = Participants_Dynamic(model_name);
        const data = await particpants_model.find({ "email": input });
        console.log()
        return res.status(200).json({ data, invalid: false })
    }
    else {
        return res.status(200).json({ "message": "inavlid input", invalid: true })
    }
})

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}


async function doesCollectionExist(collectionNameToCheck) {
    try {

        const collections = await dbconnnection.connection.db.listCollections().toArray();
        //   console.log(collections);
        const collectionExists = collections.some(collection => collection.name === collectionNameToCheck);

        if (collectionExists) {
            console.log(`Collection '${collectionNameToCheck}' exists.`);
            return true;
        } else {
            console.log(`Collection '${collectionNameToCheck}' does not exist.`);
            return false;
        }

        // Close the MongoDB connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}
router.get("/get/group/:eventid", async (req, res) => {
    const event_id = req.params.eventid;
    if (!isValidObjectId(event_id)) {
        return res.status(200).json({ "message": "event is not valid" })
    }
    const model_name = "group_" + event_id;
    console.log(await doesCollectionExist("group_" + event_id))
    if (await doesCollectionExist("group_" + event_id)) {
        const group_model = Groups(model_name)
        const data = await group_model.find()
        return res.status(200).json({ "group": data, success: true })
    }
    else {
        return res.status(200).json({ success: false, "message": "invalid event id" });
    }

})


router.get("/getusergroup/:eventid/:groupid/:workshop", async (req, res) => {
    const event_id = req.params.eventid;
    const group_id = req.params.groupid;
    const workshop = req.params.workshop
    if (!isValidObjectId(event_id)) {
        return res.status(200).json({ success: false, message: "not valid event id" })
    }
    else if (!isValidObjectId(group_id)) {
        return res.status(200).json({ success: false, message: "not valid group id" })
    }
    else {
        if (await doesCollectionExist("group_" + event_id)) {
            const model_name = "particpants_" + event_id;
            const particpants_model = Participants_Dynamic(model_name);
            const data = await particpants_model.find({ "group": group_id, [`workshops.${workshop}`]: 1 });
            console.log({ "group": group_id, [`workshops.${workshop}`]: 1 })
            if (!data) {
                res.status(200).json({ success: false, message: "no data" })
            }
            return res.status(200).json({ success: true, data })
        }
        else {
            return res.status(200).json({ success: false, message: "group does not exists" })
        }


    }

})
router.get("/getusergroup/unverify/:eventid/:groupid/:workshop", async (req, res) => {
    const event_id = req.params.eventid;
    const group_id = req.params.groupid;
    const workshop = req.params.workshop
    if (!isValidObjectId(event_id)) {
        return res.status(200).json({ success: false, message: "not valid event id" })
    }
    else if (!isValidObjectId(group_id)) {
        return res.status(200).json({ success: false, message: "not valid group id" })
    }
    else {
        if (await doesCollectionExist("group_" + event_id)) {
            const model_name = "particpants_" + event_id;
            const particpants_model = Participants_Dynamic(model_name);
            const data = await particpants_model.find({ "group": group_id, [`workshops.${workshop}`]: 2 });
            console.log({ "group": group_id, [`workshops.${workshop}`]: 1 })
            if (!data) {
                res.status(200).json({ success: false, message: "no data" })
            }
            return res.status(200).json({ success: true, data })
        }
        else {
            return res.status(200).json({ success: false, message: "group does not exists" })
        }


    }

})

module.exports = router