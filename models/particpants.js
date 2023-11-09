const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema(
    {
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
        }
    }
);


// const Participants = mongoose.model("Participant", participantSchema);


const Participants_Dynamic = (modelname)=>{
    return mongoose.model(modelname, participantSchema);
}

module.exports = { Participants_Dynamic};