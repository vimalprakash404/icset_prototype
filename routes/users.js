const express = require("express");
const router = express.Router();
const User =  require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')



router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role, mobile, organization } = req.body;

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format. Please provide a valid email address.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role, mobile, organization });

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error: 'Invalid mobile number format. Please provide a 10-digit number.' });
        }

        if (role === "host") {
            console.log(organization);
            if (organization === undefined) {
                return res.status(400).json({ message: "Please enter the organization name." });
            }
        }

        if (await User.findOne({ email: email })) {
            return res.status(400).json({ message: "Email already used." });
        }

        console.log(user);
        await user.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Registration failed" });
    }
});

module.exports = router;



router.post("/login",async (req, res)=> {
    const { email , password  } = req.body;
        try {
            const user = await  User.findOne({email});
        if (!user)
        {
            return res.status(401).json({error :"Authentication failed", message : "user not found",status: false});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if ( !isPasswordValid)
        {
            return res.status(401).json({error : "Authentication failed", message : "wrong password" ,status: false})
        }

        const token = jwt.sign({userId : user._id},"key",{expiresIn : '3h'});
        return res.status(200).json({token , userId : user._id, role : user.role , name : user.username , status : true})
    }
    catch (error)
    {
        return res.status(500).json({error : "Login failed"});
    }
    

})
module.exports = router
