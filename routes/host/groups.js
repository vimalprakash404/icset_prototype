const express = require("express")
const router = express.Router()
const { Groups } = require("../../models/group")
const event_model = require("../../models/event")
const { body, validationResult } = require("express-validator");
const db = require("../../db/connection")


function checkCollectionExists(collectionName) {
  return db.connection.db.listCollections({ name: collectionName }).next((err, collinfo) => {
    if (err) {
      console.error(`Error checking collection: ${err}`);
      return false;
    }
    else {
      return true;
    }
  });
}


router.get("/:eventId", async (req, res) => {
  const { eventId } = req.params
  if ((await checkCollectionExists("group_" + eventId)) === false) {
    return res.status(404).json({ message: "event not found" })
  }
  else {
    return res.status(200).json({ "data": await Groups("group_" + eventId).find({}) })
  }
})

const group_validator = [
  body("name").isString().notEmpty(),
  body("event").isMongoId(),
];

const edit_group_validator = [
  body("name").isString().notEmpty(),
  body("event").isMongoId(),
  body("id").isMongoId()
];


router.post("/add", group_validator, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  else {
    if (await event_model.findOne({ _id: req.body.event }).exists) {
      console.log(req.body.event)
      const data_model = Groups("group_" + req.body.event)
      const group = new data_model(req.body);
      group.save();
      return res.status(200).json({ message: "data saved" })
    }
    else {
      return res.status(404).json({ message: "event not found" })
    }

  }
});

router.post("/edit", edit_group_validator, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  else {
    if (await event_model.findOne({ _id: req.body.event }).exists) {
      const data_model = Groups("group_" + req.body.event)
      console.log(await data_model.find({}))
      console.log(await data_model.findByIdAndUpdate(req.body.id,
        req.body,
        { new: true }
      ))

      return res.status(200).json({ message: "data saved" })
    }
    else {
      return res.status(404).json({ message: "event  found" })
    }

  }
})

const delete_group_is_validator  = [
  body("id").isMongoId(),
  body("event").isMongoId()
]


router.post("/delete" , delete_group_is_validator,async (req , res) => {
  const error = validationResult(req)
  if (!error.isEmpty())
  {
    return res.status(400).json({error : error.array()})
  }
  if (await event_model.findOne({_id : req.body.id}).exists){
    if ((await checkCollectionExists("group_"+req.body.event))!==null){
      const data_model = Groups("group_" + req.body.event)
      await data_model.findOneAndDelete(req.params.id)
      return res.status(200).json({"message" : "deleted"})
    }
    else {
      return res.status(404).json({"message" : "group not found"})
    }
  }
  else{
    return res.status(404).json({"message" : "event not found"})
  }
})





module.exports = router