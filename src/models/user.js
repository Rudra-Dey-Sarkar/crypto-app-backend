const mongoose = require("mongoose");
//User schema model creation 
const userSchemaModel = new mongoose.Schema({
    username:String,
    email:String,
    password:String,
});

module.exports = mongoose.model("users", userSchemaModel);