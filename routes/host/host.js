const express = require("express");
const router = express.Router();
const event = require("./event")

router.use("/event",event)

module.exports = router ;