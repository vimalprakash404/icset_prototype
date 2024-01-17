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
    }, 
    maximumparticipants : {
        type : Number ,
        require : true
    },
    startdate : Date ,
    enddate  :  Date , 
})


const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;