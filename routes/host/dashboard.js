const express = require("express")
const  router = express.Router()
const mongoose = require("mongoose")

const {Participants_Dynamic} = require("../../models/particpants")
const Event = require("../../models/event")


router.get("/:event",async (req, res) => {
  try{
    const event_id = req.params.event
    console.log(event_id)
    const modelName = "particpants_" + event_id;
    const event_ob = await Event.findOne({_id:event_id});
    console.log("data")
    const workshoplist = event_ob.workshops
    // const event_data =  await event_ob.find({_id:event_id})
    const newModel = Participants_Dynamic(modelName);
    const total_user =  await newModel.find({}).count()
    const total_verified = await newModel.find({time_stamp : { $ne: null, $exists: true }}).count()
    let verfied_workshop = [];
    let total_workshop = [] ;
    for (const item of workshoplist) {
        console.log(item);
        let temp_data = "workshops." + item;
        console.log(verfied_workshop);
    
        const verified_data = await newModel.find({ [temp_data]: 2 }).count();
        const register_data = await newModel.find({ [temp_data]: { $in: [1, 2] } }).count();
    
        console.log(verfied_workshop);
    
        total_workshop.push({
          key: item,
          value: register_data,
        });

        verfied_workshop.push({
            key: item,
          value: verified_data
        })
      }
    res.status(200).send({total_user , total_verified , workshoplist, verfied_workshop, total_workshop})
}
catch(error){
  console.error(error);
  res.status(500).send({error})
}})

module.exports = router 