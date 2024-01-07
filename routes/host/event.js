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




router.post("/create", authentication, isHost, async (req, res) => {
    const { title, description, venu, date, workshops, icon } = req.body;
    // console.log(req.user.userId);
    if (!title) {
        return res.status(403).json({ message: "title not entered", validation: false });
    }

    if (!description) {
        return res.status(403).json({ message: "description not entered", validation: false });
    }
    if (!venu) {
        return res.status(403).json({ message: "venu not entered", validation: false });
    }
    if (!date) {
        return res.status(403).json({ message: "event date not entered", validation: false });
    }
    if (!icon) {
        return res.status(403).json({ message: "icon not entered", validation: false });
    }
    else {
        if (!isDate(date)) {
            return res.status(403).json({ message: "event date is not valid", validation: false })
        }

    }
    if (!workshops) {
        return res.status(403).json({ message: "workshops not entered", validation: false });
    }
    else {
        if (!isArray(workshops)) {
            return res.status(403).json({ message: "workkshops should be in array ", validation: false })
        }

    }
    let workkshops_names = []



    // const host = req.user.userId;

    const host = req.user.userId;
    let event_ob = new Event({ title, description, venu, date, workshops, host, icon });
    for (let i = 0; i < workshops.length; i++) {
        if (!isObject(workshops[i])) {
            return res.status(400).send({ "message": "workshop is not valid form" })

        }
        else {
            if (worshop_inserter(workshops[i], res, event_ob._id))
                workkshops_names.push(workshops[i].workshopname)
        }
    }
    event_ob.workshops = workkshops_names;
    console.log(event_ob)
    event_ob.save();
    return res.status(200).send({ success: true, message: "Event created success" })
})


function worshop_inserter(data, res, event_Id) {
    const { workshopname, workshopdescription, workshopvenue, workshopicon, workshopdate } = data;
    if (workshopname === undefined) {
        const message = "workshop name  undefined"
        return res.status(400).json({ message })
    }
    if (workshopdescription === undefined) {
        const message = "workshop description is undefined"
        return res.status(400).json({ message })
    }
    if (workshopdate === undefined) {
        const message = "workshop date is not defined  " + workshopname
        return res.status(400).json({ message })
    }
    if (workshopvenue === undefined) {
        const message = "workshop venu is not defined"
        return res.status(400).json({ message })
    }
    if (workshopicon === undefined) {
        const message = "worhshop icon is not defined"
        return res.status(400).json({ message })
    }
    workshop_saver(workshopname, workshopdescription, workshopvenue, workshopdate, event_Id, workshopicon, res)
    return true

}

function workshop_saver(title, description, venu, date, event, icon, res) {
    try {
        const data = new worhshop_model({ title, description, venu, date, event, icon })
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
        if (event.length === 0) {
            return res.status(200).json({ event });
        }
        else {
            return res.status(200).json(event)
        }
    }
});

var isDate = function (date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

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


// router.post("/edit", async (req, res) => {
//     try {
//         const { title, description, venu, date, icon } = req.body;
//         if (!title) {
//             return res.status(403).json({ message: "title not entered", validation: false });
//         }

//         if (!description) {
//             return res.status(403).json({ message: "description not entered", validation: false });
//         }
//         if (!venu) {
//             return res.status(403).json({ message: "venu not entered", validation: false });
//         }
//         if (!date) {
//             return res.status(403).json({ message: "event date not entered", validation: false });
//         }
//         if (!icon) {
//             return res.status(403).json({ message: "icon not entered", validation: false });
//         }
//     }
//     catch (error) {

//     }
// })


module.exports = router;