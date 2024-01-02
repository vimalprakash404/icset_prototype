const express = require('express');
const router = express.Router();
const authentication  = require("../../middleware/auth") 
const {isHost} = require("../../middleware/host") 
const Event = require("../../models/event");
const { ObjectId } = require('mongodb');
router.post("/create",(req, res) => {
    const {title, description, venu, date, workshops} =req.body;
    // console.log(req.user.userId);
    if(!title)
    {
        return res.status(500).json({message:"title not entered", validation  : false});
    }

    if(!description)
    {
        return res.status(500).json({message:"description not entered", validation  : false});
    }
    if(!venu)
    {
        return res.status(500).json({message:"venu not entered", validation  : false});
    }
    if(!date)
    {
        return res.status(500).json({message:"date not entered", validation  : false});
    }
    else{
        if(!isDate(date))
        {
            return res.status(500).json({message: "date is not valid", validation : false})
        }
        
    }
    if(!workshops)
    {
        return res.status(500).json({message:"workshops not entered", validation  : false});
    }
    else {
        if (!isArray(workshops))
        {
            return res.status(500).json({message  : "workkshops should be in array ", validation : false })
        }

    }
    // const host = req.user.userId;
    const host = "656d64b2eb4f42945487e4f6";
    const event_ob = new Event({title , description , venu , date , workshops, host});
    event_ob.save(); 
    return res.status(200).send({success : true, message  : "Event created success"})
})


router.post("/",authentication, isHost,async (req,res)=>{
    console.log(req.user);
    const userid = req.user.userId ;
  if (!ObjectId.isValid(userid))
  {
    return res.status(200).json({ validation : false , message :" wrong user id "})
  }
  else {
    const event = await  Event.find({host : new ObjectId(userid)})
    if (event.length === 0)
    {
        return res.status(400).json({message :" event not found"});
    }
    else {
        return res.status(400).json(event)
    }
  }
});


var isDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

function isArray(variable) {
    return Array.isArray(variable);
  }
module.exports = router;