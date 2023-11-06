const jwt = require("jsonwebtoken")
const User= require("../models/user")

function isHost(req,res,next)
{
    // console.log(req.user.userId)
    let  user = " ";
    User.findOne({ _id: req.user.userId}).then((objects) => {
        // console.log(objects);
        if  (objects.role === "host") 
            {
                console.log("true")
                req.user.role="host"
                next();
            }
            else
            {
                return res.status(403).json({message : "permission denied"});
            }
      }).catch((err) => {
        console.error(err);
      });
     
    

}
module.exports = {isHost};