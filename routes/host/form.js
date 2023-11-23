const express = require('express');
const router = express.Router();
const { Participants_Dynamic } = require("../../models/particpants")
const event_model = require("../../models/event");
const { ObjectId } = require('mongodb');
// const { validate } = require('../../models/user');
const db_connection = require("../../db/connection");
const mongoose = require('mongoose')
const { Groups, groupsSchema } = require('../../models/group');
const workshop = require("../../models/workshop")


router.get("/", (req, res) => {
    return res.status(400).json({ message: " we are here" })
})

router.post("/create/participants", async (req, res) => {
    const { event } = req.body;
    if (!ObjectId.isValid(event)) {
        return res.status(400).json({ validation: false, message: "wrong event id" })
    }
    const event_object = await event_model.findById(event).exec();
    console.log(event_object)
    if (!event_object) {
        return res.status(404).json({ message: "event not found" })
    }
    const modelName = "particpants_" + event;
    const collections = await db_connection.mongoose.connection.db.listCollections().toArray();
    const modelExists = collections.some((collection) => collection.name === modelName.toLowerCase());

    if (!modelExists) {
        const workshop_model = await workshop.find();
        console.log(workshop_model);
        let Schema_data = {};

        for (let i = 0; i < event_object.workshops.length; i++) {
            let key = event_object.workshops[i]; // Replace event_object.workshops[i] with your actual key
            let data = { [key]: {type  : "Number" , default: "0"} };
            Schema_data = { ...Schema_data, ...data };
        }

        console.log(Schema_data);
        Participants_Dynamic(modelName);
        return res.status(400).json({ success: true, message: "model added" });
    }
    else {
        return res.status(400).json({ success: false, message: "model already created" });
    }

});

router.post("/participants/add", async (req, res) => {
    const { event } = re
    return res.status(400).json({ message: "event not founded" })
});

router.post("/create/group", async (req, res) => {
    const { event } = req.body
    const data = await createGroup(event);
    return res.status(400).json(data);
});
async function createGroup(event) {
    if (!ObjectId.isValid(event)) {
        return { success: false, message: "invalid event id" }
    }
    else {
        const event_ob = await event_model.findById(event).exec();
        if (!event_ob) {
            return { success: false, message: "event not found" }
        }
        const modelName = "group_" + event;
        const collections = await db_connection.mongoose.connection.db.listCollections().toArray();
        const modelExist = collections.some((collection) => collection.name === modelName.toLowerCase());
        if (modelExist) {
            return { success: false, message: "colletion already created" }
        }
        else {
            Groups(modelName)
            return { success: true, message: " collection created" }
        }
    }
}

router.post("/group/add", (req, res) => {
    const { event, name } = req.body
    addgroupdata(res, event, name);
})



async function addgroupdata(res, event, name) {
    modelName = "group_" + event;
    const newGroupdata = mongoose.model(modelName, groupsSchema);
    console.log(newGroupdata);
    const dataExist = await newGroupdata.findOne({ name: name })
    console.log(dataExist)
    if (dataExist) {
        return res.status(400).json({ message: "name duplication not allowed" })
    }
    else {
        const newGroupdata = mongoose.model(modelName, groupsSchema);
        const dataob = new newGroupdata({ name: name });
        console.log(name)
        dataob.save();
        return res.status(400).json({ message: "added" })
    }
}

// create 
router.get("/group", async (request, responce) => {
    const { event } = request.body;
    if (!ObjectId.isValid(event)) {
        return responce.status(400).json({ success: false, message: "object is not valid" })
    }
    else {
        const modelName = "group_" + event;
        const collections = await db_connection.mongoose.connection.db.listCollections().toArray();
        const modelExists = collections.some((collection) => collection.name === modelName.toLowerCase());
        if (!modelExists) {
            return responce.status(400).json({ success: false, message: "group did not found" })
        }
        else {
            const groupModel = mongoose.model(modelName, groupsSchema);
            const groupObject = await groupModel.find({});
            return responce.status(400).json({ success: true, event: groupObject })
        }
    }
});



module.exports = router;