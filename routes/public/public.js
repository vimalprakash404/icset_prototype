const express =  require('express');
const router = express.Router();
const participants = require("./participant")
const event_model = require("../../models/particpants")

router.use("/participants",participants);
module.exports = router ;
