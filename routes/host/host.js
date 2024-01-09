const express = require("express");
const router = express.Router();
const event = require("./event")
const {workshop_router} = require("./workshop");
const form_router = require("./form")
const group = require("./groups")
const { ReadPreference } = require("mongodb");
const dashboard  = require("./dashboard")
router.use("/dashboard",dashboard);
router.use("/event",event)
router.use("/workshop",workshop_router);
router.use("/form",form_router);
router.use("/group", group);
module.exports = router ;