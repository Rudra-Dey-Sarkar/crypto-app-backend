require("dotenv").config();
const ConnectDB = require("./src/config/db");
const express = require("express");
const cors = require("cors");

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

const app = express()
app.use(cors(corsOptions));
app.use(express.json());

ConnectDB();

app.get("/", async (req, res)=>{

    res.json("working");
})


app.listen(process.env.PORT,()=>{
    console.log("App is listening in the port :-", process.env.PORT);
})
