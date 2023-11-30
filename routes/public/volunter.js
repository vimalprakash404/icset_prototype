const express = require("express")
const router = express.Router();
const { Participants_Dynamic } = require("../../models/particpants");

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
        
        if (data.workshops[workshop] === 0)
        {
            return res.status(200).json({"verification":false,"message":"not register for work shop"})
        }
        else if(data.workshops[workshop] === 2)
        {
            return res.status(200).json({"verification":false,"message":"verified"})
        }
        data.workshops[workshop] = 2;
        await data.save();
        await particpants_model.updateOne({ event: eventid, _id: userid }, data)
        return res.status(400).json({ "verification": true })
    }
    catch (err) {
        return res.status(400).json({ "verification": false , "error" : err})
    }

});


module.exports = router