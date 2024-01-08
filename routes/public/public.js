const express =  require('express');
const router = express.Router();
const participants = require("./participant")
const event_model = require("../../models/particpants")
const event = require("./event")
const workshop = require("./workshop")
const volunter = require("./volunter")
const form = require("./form")


router.use("/participants",participants);
router.use("/event",event),
router.use("/workshop",workshop),
router.use("",volunter)
router.use("/form",form)
module.exports = router ;
