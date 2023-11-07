const mongoose = require("mongoose")

const workshopSchema=  new mongoose.Schema({
    title :
    {
        type : String,
        require : true ,
    },
    description : String ,
    venu : String,
    date : Date,
    event : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : "Event",
    }
})


const Workshop = mongoose.model("Workshop", workshopSchema);

module.exports = Workshop;