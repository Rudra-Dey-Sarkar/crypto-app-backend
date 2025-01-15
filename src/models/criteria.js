//Creating database schema models
const mongoose = require("mongoose");

const criteriaSchemaModel = new mongoose.Schema({
    userId: String,
    criteria: [
        {
            coinId: String,
            less: Number,
            greater: Number,
            time: {
                lessTime: {
                    date: String,
                    status: Boolean
                },
                greaterTime: {
                    date: String,
                    status: Boolean
                }
            }
        }
    ]
})

module.exports = mongoose.model("criterias", criteriaSchemaModel);