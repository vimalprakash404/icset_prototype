const mongoos = require ('mongoose')

//  define the user model schema 

const logSchema = new mongoos.Schema(
    {
        action :{
            type   : String ,
            require : true
        },
        time :{
            type: Date, 
            default: Date.now 
        },
        by : {
            type : mongoos.Schema.Types.ObjectId,
        },
        workshop : {
            type : String
        },
        participants:{
            type : mongoos.Schema.Types.ObjectId,
        }
    }
)

const logDynamic =(modelname)=>{ 
    return mongoos.model(modelname, logSchema);
}

module.exports = {logDynamic};