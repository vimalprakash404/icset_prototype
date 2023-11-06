const mongoos = require ('mongoose')

//  define the user model schema 

const userSchema = new mongoos.Schema(
    {
        username :{
            type   : String ,
            require : true
        },
        email : {
            type : String ,
            require : true,
            unique : true ,
        },
        password : {
            type : String , 
            require : true,
        },

        role : {
            type : String , 
            enum : [ "eventHost", "volunteer", "admin"],
            default : "eventHost"
        }
    }
)

const User = mongoos.model("User", userSchema);

module.exports = User;