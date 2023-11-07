const express = require("express");
const router = express.Router();
const event = require("./event")
const {workshop_router} = require("./workshop");
const { ReadPreference } = require("mongodb");
router.use("/event",event)
router.use("/workshop",workshop_router);
module.exports = router ;