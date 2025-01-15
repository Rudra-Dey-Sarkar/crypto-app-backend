//Creating database connection
require("dotenv").config();
const mongoose = require("mongoose");

const ConnectDB = ()=>{
mongoose.connect(process.env.DB).then(()=>{
    console.log("Database connected");
}).catch((errors)=>{

    console.log("Cannot connect to the database due to :-", errors);
})
}

module.exports = ConnectDB;