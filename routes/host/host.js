const express = require("express");
const router = express.Router();
const event = require("./event")
const {workshop_router} = require("./workshop");
const form_router = require("./form")
const { ReadPreference } = require("mongodb");
router.use("/event",event)
router.use("/workshop",workshop_router);
router.use("/form",form_router);
module.exports = router ;