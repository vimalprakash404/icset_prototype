const jwt = require("jsonwebtoken")
function authentication(req,res,next)
{
    const token = req.header("Authoriztion");
    if(!token)
    {
        return res.status(401).json({message : "Aithentication required"});
    }

    jwt.verify(token,'key', (err, user)=>
    {
        if (err)
        {
            return res.status(403).json({message : "invalid token"});
        }
        req.user = user;
        //  console.log(user);
        next();
    });
}


module.exports = authentication;