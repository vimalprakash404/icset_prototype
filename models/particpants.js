const mongoose = require('mongoose')



// const Participants = mongoose.model("Participant", participantSchema);
const dynamic_schema = new mongoose.Schema({
  name : {
      type : String ,
      required  : true,
  },
  email :{
      type : String ,
      required : true,
  },
  mobile : {
      type :Number,
      required : true, 
  },

  event :{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Event"
  },
  group :{
    type : mongoose.Schema.Types.ObjectId,
  },
workshops:mongoose.Schema.Types.Mixed
})

const Participants_Dynamic = (modelname)=>{
    return mongoose.model(modelname, dynamic_schema);
}
module.exports = { Participants_Dynamic};