const mongoos = require('mongoose');

const eventSchema = new mongoos.Schema({
    title  :
    {
        type  : String ,
        require : true ,
    },
    description : String ,
    venu : String,
    date : Date,
    workshops : Array, 
    host : {
        type : mongoos.Schema.Types.ObjectId,
        ref : 'User',
    }
});

const Event = mongoos.model('Event',eventSchema);

module.export = Event;