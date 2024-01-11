const mongoose = require('mongoose')



// const Participants = mongoose.model("Participant", participantSchema);
const dynamic_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event"
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
    },
    workshops: mongoose.Schema.Types.Mixed,
    time: mongoose.Schema.Types.Mixed,
    time_stamp: {
        type: Date,
        default: null
    },
    state : {
        type : String,
        default : null
    },
    district : {
        type : String,
        default : null
    },
    gender : {
        type : String , 
        enum : [ "male", "female", "others"],
        default : null
    } 
})


dynamic_schema.statics.getTotalUser = async function (){
    try { 
        const  totalUsers = await this.countDocuments();
        return totalUsers ;
    }
    catch (error){
        return errors ;
    }
}

const Participants_Dynamic = (modelname) => {
    return mongoose.model(modelname, dynamic_schema);
}
module.exports = { Participants_Dynamic };