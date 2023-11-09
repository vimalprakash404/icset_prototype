const mongoose = require('mongoose')

const groupsSchema = new mongoose.Schema({
    name:{
        type : String
    }
});

const Groups = (name)=>{ return  mongoose.model(name,groupsSchema);}
module.exports = {Groups,groupsSchema};