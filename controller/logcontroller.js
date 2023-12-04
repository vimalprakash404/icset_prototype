const {logDynamic} = require("../models/log")
const dbconnnection = require("../db/connection")
async function  create_model(event){
    const model_name = "log_"+event;
    console.log("data")
    const model = logDynamic(model_name);
}

function check_model(name){
}

function insert_model(name,action,by,workshop,participants){
    const model_name = "log_"+name;
    console.log("data")
    const log_model = logDynamic(model_name);
    log_model.create({action: action, workshop : workshop, participants : participants , by :by})
}

module.exports = {create_model,insert_model}