const mongoose = require("mongoose")

const workshopSchema=  new mongoose.Schema({
    title :
    {
        type : String,
        require : true ,
        unique: false
    },
    description : String ,
    venu : String,
    date : Date,
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Event",
    },
    icon : {
        type  :  String  ,
        require : true 
    }
})


const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;