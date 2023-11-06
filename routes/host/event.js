const express = require('express');
const router = express.Router();
const authentication  = require("../../middleware/auth") 
const {isHost} = require("../../middleware/host") 
router.post("/create",authentication,isHost,(req, res) => {
    const {title, description, venu, date, workshops} =req.body;
    console.log(req.user.userId);
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
    
    return res.status(400).send({message :"data is working"})
})

var isDate = function(date) {
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

function isArray(variable) {
    return Array.isArray(variable);
  }
module.exports = router;