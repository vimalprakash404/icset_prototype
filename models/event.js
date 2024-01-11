const mongoos = require('mongoose');

const eventSchema = new mongoos.Schema({
    title  :
    {
        type  : String ,
        require : true ,
    },
    description : String ,
    venu : String,
    workshops : Array, 
    host : {
        type : mongoos.Schema.Types.ObjectId,
        ref : 'User',
    },
    icon :  String,
    start_date_time : Date,
    end_date_time : Date,
    cancel : {
        type : Boolean , 
        default : false
    },
    approve : {
        type :Boolean ,
        default : false
    }
});

const Event = mongoos.model('Event',eventSchema);

module.exports = Event;