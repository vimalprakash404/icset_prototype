const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const { Participants_Dynamic } = require("../../models/particpants");
const dbconnnection = require("../../db/connection")
const {Groups} = require("../../models/group")
router.post("/verify", async (req, res) => {
    const { workshop, userid, eventid } = req.body;
    try {
        if (!workshop) {
            return res.status(403).send({ "message": "please enter the workshop data", "validation": false })
        }
        else if (!userid) {
            return res.status(403).send({ "message": "please the userid ", 'validation': false });
        }
        else if (!eventid) {
            return res.status(403).send({ "message": "plesae the eventid", "validation": false });
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
        await data.save();
        await particpants_model.updateOne({ event: eventid, _id: userid }, data)
        return res.status(400).json({ "verification": true })
    }
    catch (err) {
        return res.status(400).json({ "verification": false, "error": err })
    }

});

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
        return res.status(400).json({ "message": "event is not valid" })
    }
    const model_name="group_"+event_id;
    console.log(await doesCollectionExist("group_" + event_id))
    if (await doesCollectionExist("group_" + event_id)) {
        const group_model= Groups(model_name)
        const data =await group_model.find()
        return res.status(400).json({"group":data, success : true})
    }
    else {
        return res.status(200).json({success : false ,"message" : "invalid event id" });
    }
    
})


router.get("/getusergroup/:eventid/:groupid/:workshop",async (req, res) => {
    const event_id = req.params.eventid;
    const group_id = req.params.groupid;
    const workshop = req.params.workshop
    if (!isValidObjectId(event_id))
    {
        return res.status(400).json({success : false , message : "not valid event id"})
    }
    else if(!isValidObjectId(group_id)){
        return res.status(400).json({success : false , message : "not valid group id"})
    }
    else{
        if (await doesCollectionExist("group_"+event_id)){
            const model_name = "particpants_"+event_id;
            const particpants_model = Participants_Dynamic(model_name);
            const data = await particpants_model.find({"group":group_id,[`workshops.${workshop}`]:1});
            console.log({"group":group_id,[`workshops.${workshop}`]:1 })
            if (!data){
                res.status(200).json({success:false, message : "no data"})
            }
            return res.status(200).json({success : true , data})
        }
        else{
            return res.status(400).json({success : false , message : "group does not exists"})
        }
        
        
    }

})
module.exports = router