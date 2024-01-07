const express = require("express")
const workshop_router = express.Router();
const authentication = require("../../middleware/auth")
const {isHost} = require("../../middleware/host")
const workshop_model = require("../../models/workshop")
const event_model = require("../../models/event");
const { ObjectId } = require("mongodb");
const { body, validationResult } = require("express-validator");




workshop_router.post("/create", authentication, isHost,async (req, res) => {
    const { title, description, venu, event, date } = req.body;
    const responce = await create_event(title, description,event,date,venu);
    return res.status(400).send(responce);
});

workshop_router.get("/",authentication,isHost,async (req, res) => {
    const {event} = req.body ;
    console.log(event)
    try{
        if (!ObjectId.isValid(event))
        {
            return res.status(201).json({validation : false , message  : "not valid event  id"})
        }
        const  event_ob = await event_model.findById(event).exec();
         console.log(event_ob)
        if(!event_ob)
        {
            return res.status(400).json({validation : false , message : " not valid event id" })
        }
        else {

            const workkshops_ob  = await workshop_model.find({ event : event });
            if (workkshops_ob.length === 0)
            {
                return res.status(400).json({message:"not data found"});
            }
            else{
                return res.status(200).json(workkshops_ob);
            }
        }
    }
    catch (error)
    {
        return res.status(401).json({validation : false , message  : "not valid event  id", error})
    }
});


async function create_event (title, description, event, date, venu)
{
    try {
        if (!title) {
            return { validation: false, message: "workshop  title not found" } ;
        }
        else
        {
            const ob=await workshop_model.findOne({title, event}).exec();
            console.log(ob);
            if (ob)
                {
                    console.log("if working");
                return {validation  : false , message  : "workshop with duplicate name"};
                }
        }
        if (!description) {
            return { validation: false, message: "descrption not found " } ;
        }
        if (!venu) {
            return { validation: false, message: "venu is not defined" };
        }
        if (!event) {
            return { validation: false, message: "event  is not define " } ;
        }
        else {
            if(ObjectId.isValid(event))
            {
                const ob=await event_model.findById(event).exec();
                console.log(ob);
                if (!ob)
                    return {message : "event id is not valid"}
            }
            else 
            {
                return {message : "objectid is not valid "}
            }
        }
        if (!date) {
            return { validation: false, message: "date is not valid" };
        }
        const workkshops_ob = new workshop_model({ title, description, venu, date, event })
        workkshops_ob.save();
        return { message: "validation created succesfull" , validation : true};
    }
    catch(error)
    {
        return {validation : false , error : error, message : "something went wrong"} ;
    }

}

const validateWorkshop = [
    body("title").isString().notEmpty(),
    body("description").isString(),
    body("venu").isString(),
    body("date").isISO8601().toDate(),
    body("event").isMongoId(),
    body("icon").isString().notEmpty(),
  ];


workshop_router.post("/add", validateWorkshop, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const workshop = new workshop_model(req.body);
      const savedWorkshop = await workshop.save();
      const eventId = req.body.event;
      const result = await event_model.findOneAndUpdate(
        { _id: eventId },
        { $push: { workshops: workshop.title } },
        { new: true } // This option returns the modified document
      );
      console.log(result)
      res.json(savedWorkshop);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

//Edit Api 

workshop_router.post("/edit/:id", validateWorkshop, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const originalWorkshop = await workshop_model.findById(req.params.id);
      const updatedWorkshop = await workshop_model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (originalWorkshop.title !== req.body.title) {
        // Find the corresponding event and update the workshop title in the array
        const eventId = originalWorkshop.event; // Assuming event is stored in the workshop model
        await event_model.findByIdAndUpdate(eventId, { $pull: { workshops: originalWorkshop.title } });
        await event_model.findByIdAndUpdate(eventId, { $push: { workshops: updatedWorkshop.title } });
    }
      res.json(updatedWorkshop);
    } catch (error) {
      console.error(error.message)
      res.status(400).json({ error: error.message });
    }
  });

  workshop_router.post("/delete/:id", async (req, res) => {
    try {
        const deletedWorkshop = await workshop_model.findByIdAndDelete(req.params.id);
        console.log(deletedWorkshop);
        if (deletedWorkshop.event) {
            const eventId = deletedWorkshop.event;
            await event_model.findByIdAndUpdate(eventId, { $pull: { workshops: deletedWorkshop.title } });
        }

        res.json(deletedWorkshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
  


workshop_router.get("/get/byEvent/:eventId", async (req, res) => {
    try {
      const workshops = await workshop_model.find({ event: req.params.eventId });
      res.json(workshops);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });



module.exports = { workshop_router };