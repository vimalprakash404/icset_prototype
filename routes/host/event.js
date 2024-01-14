const express = require('express');
const router = express.Router();
const authentication = require("../../middleware/auth")
const { isHost } = require("../../middleware/host")
const Event = require("../../models/event");
const { ObjectId } = require('mongodb');

const worhshop_model = require("../../models/workshop")
function isObject(data) {
    return typeof data === 'object' && data !== null;
}

router.get("/test", authentication, isHost, async (req, res) => {
    res.status(400).json({ "message": req.user.userId, "user type": req.user.role })
})

router.post("/", async (req, res) => {
    try {
        const { id } = req.body; // Assuming the ID is sent in the request body
        console.log(id)
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (deletedEvent !== null) {
            // If the event was found and deleted by ID, delete workshops based on the 'event' field
            await worhshop_model.deleteMany({ "event": id });
            return res.status(200).json({ "message": "Deleted event and associated workshops" });
        } else {
            return res.status(404).json({ "message": "Event not found" });
        }
    } catch (error) {
        return res.status(400).json({ "message": error.message });
    }
});



router.post("/create", authentication, isHost, async (req, res) => {
    var { title, description, venu, date, workshops, icon , start_date_time , end_date_time} = req.body;
    if (!title) {
        return res.status(403).json({ message: "title not entered", validation: false });
    }

    if (!description) {
        return res.status(403).json({ message: "description not entered", validation: false });
    }
    if (!venu) {
        return res.status(403).json({ message: "venu not entered", validation: false });
    }
    if (!icon) {
        return res.status(403).json({ message: "icon not entered", validation: false });
    }
    if (!workshops) {
        return res.status(403).json({ message: "workshops not entered", validation: false });
    }
    if(!start_date_time)
    {
        return res.status(403).json({ message: "start date and time not specified", validation: false });
    }
    if(!end_date_time)
    {
        return res.status(403).json({ message:"end date and time not specified", validation: false });
    }
    else {
        if (!isArray(workshops)) {
            return res.status(403).json({ message: "workshops should be in array ", validation: false })}
        if(!isDate(end_date_time)){
            return res.status(403).json({ message: "end date is not valid", validation: false })
        }
        if(!isDate(start_date_time)){
            return res.status(403).json({ message: "start date is not valid", validation: false })
        }
    }
    let workkshops_names = []



    // const host = req.user.userId;

    const host = req.user.userId;
     
    let event_ob = new Event({ title, description, venu, date, workshops, host, icon , start_date_time , end_date_time });
    for (let i = 0; i < workshops.length; i++) {
        if (!isObject(workshops[i])) {
            return res.status(400).send({ "message": "workshop is not valid form" })

        }
        else {
            if ((worshop_inserter(workshops[i], res, event_ob._id)))
                workkshops_names.push(workshops[i].workshopname)
            else {
                return
            }

        }
    }
    event_ob.workshops = workkshops_names;
    console.log(event_ob)
    event_ob.save();
    return res.status(200).send({ success: true, message: "Event created success" })
})


function worshop_inserter(data, res, event_Id) {
    const { workshopname, workshopdescription, workshopvenue, workshopicon, workshopdate , maximumparticipants } = data;
    if (workshopname === undefined) {
        const message = "workshop name  undefined"
        res.status(400).json({ message })
        return false
    }
    if (workshopdescription === undefined) {
        const message = "workshop description is undefined"
        res.status(400).json({ message })
        return false
    }
    if (workshopdate === undefined) {
        const message = "workshop date is not defined  " + workshopname
        res.status(400).json({ message })
        return false
    }
    if (workshopvenue === undefined) {
        const message = "workshop venu is not defined"
        res.status(400).json({ message })
        return false
    }
    if (workshopicon === undefined) {
        const message = "workshop icon is not defined"
        res.status(400).json({ message })
        return false
    }
    if (maximumparticipants === undefined)
    {
        const message = "maximum participants not valid"
         res.status(400).json({ message })
         return false
         
    }
    workshop_saver(workshopname, workshopdescription, workshopvenue, workshopdate, event_Id, workshopicon,maximumparticipants ,res)
    return true

}

function workshop_saver(title, description, venu, date, event, icon, maximumparticipants,res) {
    try {
        const data = new worhshop_model({ title, description, venu, date, event, icon ,maximumparticipants })
        data.save()
    }
    catch (error) {
        return res.status(400).send({ error })
    }
}

router.get("/", authentication, isHost, async (req, res) => {
    console.log(req.user);
    const userid = req.user.userId;
    if (!ObjectId.isValid(userid)) {
        return res.status(200).json({ validation: false, message: " wrong user id " })
    }
    else {
        const event = await Event.find({ host: new ObjectId(userid) })
        if (event.length === 0) {
            return res.status(200).json({ event });
        }
        else {
            return res.status(200).json(event)
        }
    }
});


router.get("/details/:id", async (req, res) => {
    const userid = req.params.id;
    if (!ObjectId.isValid(userid)) {
        return res.status(200).json({ validation: false, message: " wrong user id " })
    }
    else {
        const event = await Event.findOne({ _id: new ObjectId(userid) })
       
            return res.status(200).json(event)
        
    }
});


// date checker function 
var isDate = function (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}


// is Array check funcion
function isArray(variable) {
    return Array.isArray(variable);
}

const editEvent = async (eventId, updatedEventData) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(eventId, updatedEventData, { new: true });
        return updatedEvent;
    } catch (error) {
        throw error;
    }
};





router.post("/edit", async (req, res) => {
    try {
        const { title, description, venu, date, icon ,start_date_time , end_date_time } = req.body;
        if (!title) {
            return res.status(403).json({ message: "title not entered", validation: false });
        }

        if (!description) {
            return res.status(403).json({ message: "description not entered", validation: false });
        }
        if (!venu) {
            return res.status(403).json({ message: "venu not entered", validation: false });
        }
        if (!icon) {
            return res.status(403).json({ message: "icon not entered", validation: false });
        }
        if (!start_date_time){
            return res.status(403).json({ message: "start date and time not entered", validation: false });
        }
        if (!end_date_time){
            return res.status(403).json({ message: "end date and time not entered", validation: false })
        }
        console.log("data added")
        editEvent(req.body._id,req.body);
        return res.status(200).json({"message" : "data added"})
    }
    catch (error) {
        return res.status(400).json({ message: "error while edit data", validation: false })
    }
})


// api end point for cancel event 
router.post("/cancel",async(req,res)=> {
    try{
        const {id} =req.body;
        const data=await Event.findByIdAndUpdate({"_id":id},{"cancel" : true})
        console.log(data)
        if(data === null){
            return res.status(400).json({"message" : "user not exist"})
        }
        else{
            return res.status(200).json({"message" : "updated"})
        }
    }
    catch (error){
        return res.status(400).json({"message" : error})
    }
})


module.exports = router;