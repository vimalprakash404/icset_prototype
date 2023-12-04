
const User= require("../models/user")

function isVolunter(req,res,next)
{
    // console.log(req.user.userId)
    let  user = " ";
    User.findOne({ _id: req.user.userId}).then((objects) => {
        console.log(objects);
        if  (objects.role === "volunteer") 
            {
                req.user.role="volunteer"
                next();
            }
            else
            {
                return res.status(403).json({message : "permission denied" , authentication : false});
            }
      }).catch((err) => {
        console.error(err);
      });
     
    

}
module.exports = {isVolunter};