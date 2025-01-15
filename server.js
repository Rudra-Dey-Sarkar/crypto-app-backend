// Load environment variables from .env file
require("dotenv").config();
// Import required libraries
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const cron = require('node-cron');

// Initialize express app
const app = express();

// Import custom modules
const userSchemaModels = require("./src/models/user"); // User schema model for database interaction
const criteriaSchemaModel = require("./src/models/criteria");
const ConnectDB = require("./src/config/db"); // Database connection module

//Date in proper formate
const date = new Date();
const formattedDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

// Define CORS options to allow cross-origin requests
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

// Middleware configuration
app.use(cors(corsOptions)); // Use CORS middleware with specified options
app.use(express.json()); // Parse JSON payloads

// Establish database connection
ConnectDB();

// Configure nodemailer transporter for sending notifications
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Sender's email from environment variables
        pass: process.env.PW,    // Sender's password from environment variables
    },
});
// Function to send email notifications
const sendNotification = (email, message) => {
    console.log(`Attempting to send email to: ${email}`);
    transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Appointment Update',
        text: message,
    }, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent successfully:", info.response);
        }
    });
};


// Test route to check if the server is working
app.get("/", async (req, res) => {
    try {
        res.json("Working");
    } catch (errors) {
        console.log(errors);
    }
});

// Route to register a new user
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    const datas = {
        username: username,
        email: email,
        password: password
    };

    try {
        const response1 = await userSchemaModels.find({ username: username });
        const response2 = await userSchemaModels.find({ email: email });

        if (response1?.length > 0 && response2?.length > 0) {
            res.status(404).json("Username and Email Already Exist");
        } else if (response1?.length > 0) {
            res.status(404).json("Username Already Exist");
        } else if (response2?.length > 0) {
            res.status(404).json("Email Already Exist");
        } else {
            await userSchemaModels.insertMany([datas])
                .then((data) => {
                    res.status(200).json(data);
                })
                .catch((err) => {
                    res.status(404).json(err);
                });
        }
    } catch (err) {
        console.log(err);
    }
});
// Route to log in a user
app.post("/login", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (username !== undefined) {
            await userSchemaModels.find({ username: username })
                .then((data) => {
                    if (data[0].password === password) {
                        res.status(200).json(data);
                    } else {
                        res.status(404).json("Use Same Password");
                    }
                })
                .catch((err) => {
                    res.status(404).json(err);
                });
        } else if (email !== undefined) {
            await userSchemaModels.find({ email: email })
                .then((data) => {
                    if (data[0].password === password) {
                        res.status(200).json(data);
                    } else {
                        res.status(404).json("Use Same Password");
                    }
                })
                .catch((err) => {
                    res.status(404).json(err);
                });
        } else {
            res.status(404).json("please enter email or password");
        }
    } catch (err) {
        console.log(err);
    }
});

// Route to send OTP for password recovery
app.post("/forget-otp", async (req, res) => {
    const { username, email } = req.body;
    try {
        if (username !== undefined) {
            await userSchemaModels.find({ username: username })
                .then((data) => {
                    sendNotification(data[0]?.email, `OTP :- 123`);
                    res.status(200).json("OTP sent to the email but please note that if you are using deplyed endpoints you might not receive the email due to restrictions");
                })
                .catch((err) => {
                    res.status(404).json(err);
                });
        } else if (email !== undefined) {
            await userSchemaModels.find({ email: email })
                .then((data) => {
                    sendNotification(email, `OTP :- 123`);
                    res.status(200).json("OTP sent to the email");
                })
                .catch((err) => {
                    res.status(404).json(err);
                });
        } else {
            res.status(404).json("Please enter username or email");
        }
    } catch (err) {
        console.log(err);
    }
});
// Route to update password after verifying OTP
app.put("/forget", async (req, res) => {
    const { otp, username, email, password } = req.body;
    try {
        if (username !== undefined) {
            if (otp === "123") {
                await userSchemaModels.findOneAndUpdate({ username: username }, { password: password }, { new: true })
                    .then((data) => {
                        if (data) {
                            res.status(200).json({ message: "Password updated successfully", data });
                        } else {
                            res.status(404).json({ message: "User not found" });
                        }
                    })
                    .catch((err) => {
                        res.status(500).json({ error: err.message });
                    });
            } else {
                res.status(400).json({ message: "Enter correct OTP" });
            }
        } else if (email !== undefined) {
            if (otp === "123") {
                await userSchemaModels.findOneAndUpdate({ email: email }, { password: password }, { new: true })
                    .then((data) => {
                        if (data) {
                            res.status(200).json({ message: "Password updated successfully", data });
                        } else {
                            res.status(404).json({ message: "User not found" });
                        }
                    })
                    .catch((err) => {
                        res.status(500).json({ error: err.message });
                    });
            } else {
                res.status(400).json({ message: "Enter correct OTP" });
            }
        } else {
            res.status(400).json({ message: "Please enter email or username" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});
//Fetch all crypto prices then check the user criteria for each coin and send alert email to the user
async function FetchAllCrypto() {

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&x_cg_demo_api_key=${process.env.COIN_GECKO}`);
        if (response.ok) {
            const data = await response.json();
            // Find all criteria
            await criteriaSchemaModel.find().then((datas) => {
                datas?.map((e) => {
                    e?.criteria?.map((coin) => {
                        // Find all crypto data
                        data?.map((crypto) => {

                            if (coin?.coinId === crypto?.id) {
                                if (crypto?.current_price > coin?.greater) {
                                    console.log(crypto?.name, "Price Increased");
                                    //Sending one price increased email a day 
                                    if (coin?.time?.greaterTime?.date !== formattedDate && coin?.time?.greaterTime?.status !== true) {
                                        sendNotification(e?.userId, `${crypto?.name} Price Increased than your set limits`);
                                        const data = {
                                            "addNew": "false",
                                            "userId": "deysarkarrudra5@gmail.com",
                                            "criteria": [
                                                {
                                                    "coinId": coin?.coinId,
                                                    "less": coin?.less,
                                                    "greater": coin?.greater,
                                                    "time": {
                                                        "lessTime": {
                                                            "date": coin?.time?.lessTime?.date,
                                                            "status": coin?.time?.lessTime?.status
                                                        },
                                                        "greaterTime": {
                                                            "date": formattedDate,
                                                            "status": true
                                                        }
                                                    },

                                                }
                                            ],
                                        }
                                        Edit(data);
                                    }

                                } else if (crypto?.current_price < coin?.less) {
                                    console.log(crypto?.name, "Price Decreased");
                                    if (coin?.time?.greaterTime?.date !== formattedDate && coin?.time?.greaterTime?.status !== true) {
                                        //Sending one price decreased email a day 
                                        if (coin?.time?.greaterTime?.date !== formattedDate && coin?.time?.greaterTime?.status !== true) {
                                            sendNotification(e?.userId, `${crypto?.name} Price Decreased than your set limits`);
                                            const data = {
                                                "addNew": "false",
                                                "userId": "deysarkarrudra5@gmail.com",
                                                "criteria": [
                                                    {
                                                        "coinId": coin?.coinId,
                                                        "less": coin?.less,
                                                        "greater": coin?.greater,
                                                        "time": {
                                                            "lessTime": {
                                                                "date": formattedDate,
                                                                "status": true
                                                            },
                                                            "greaterTime": {
                                                                "date": coin?.time?.lessTime?.date,
                                                                "status": coin?.time?.lessTime?.status
                                                            }
                                                        },

                                                    }
                                                ],
                                            }
                                            Edit(data);
                                        }
                                    }

                                } else {
                                    console.log("Between");
                                }
                            }
                        })
                    })
                })

            }).catch((error) => {
                console.log("cannot find the data due to :-", error);
            });

            return { message: "success", data: data, status: 200 };
        } else {
            return { message: "failed", data: data, status: 400 };
        }
    } catch (error) {
        console.log("cannot fetch the coin data due to :-", error);
        return { message: "failed", data: data, status: 400 };
    }
}
//Route to get all crypto prices
app.get("/crypto-prices", async (req, res) => {
    const response = await FetchAllCrypto();
    if (response.status === 200) {
        res.json(response.data);
    } else {
        res.json("Failed");
    }
});
//Find certain criteria
app.post("/certain-criteria", async (req, res) => {
    const { userId } = req.body;
    try {

        await criteriaSchemaModel.find({ userId: userId }).then((data) => {
            res.json(data);
        }).catch((error) => {
            res.json("cannot find the data due to :-", error);
        });

    } catch (error) {
        console.log("cannot proceed to find the data due to :-", error)
    }
})
//Route to add criterias 
app.post("/add-criteria", async (req, res) => {
    const { userId, criteria, time } = req.body;
    const data = {
        userId: userId,
        criteria: criteria,
        time: time
    }
    try {
        const response = await criteriaSchemaModel.find({ userId: userId });
        if (response.length !== 0) {
            res.json("User criteria already present");
        } else {
            await criteriaSchemaModel.insertMany([data]).then((data) => {
                res.json(data);
            }).catch((error) => {
                res.json("cannot insert the data due to :-", error);
            });
        }
    } catch (error) {
        console.log("cannot proceed to insert the data due to :-", error)
    }
})
//Route to edit criterias 
app.put("/edit-criteria", async (req, res) => {
    const { addNew, userId, criteria } = req.body;
    try {
        if (addNew === true) {
            await criteriaSchemaModel.findOneAndUpdate(
                {
                    userId: userId,
                    coinId: criteria?.coinId // Match userId and coinId in nested criteria
                },
                { $push: { criteria: criteria } }, // Use $set to update the nested criteria
                { new: true } // Return updated document
            ).then((data) => {
                res.status(200).json(data);
            }).catch((error) => {
                res.status(404).json({ message: "No matching data found for the provided userId." });
            })
        } else {
            await criteriaSchemaModel.findOneAndUpdate(
                {
                    userId: userId,
                    coinId: criteria?.coinId // Match userId and coinId in nested criteria
                },
                { $set: { criteria: criteria } }, // Use $set to update the nested criteria
                { new: true } // Return updated document
            ).then((data) => {
                res.status(200).json(data);
            }).catch((error) => {
                res.status(404).json({ message: "No matching data found for the provided userId." });
            })
        }


    } catch (error) {
        console.log("cannot proceed to edit the data due to :-", error)
    }
})
//Edit criteria feature
async function Edit(data) {
    try {
        const response = await fetch("http://localhost:5000/edit-criteria", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const res = await response.json();
            console.log(res);
        } else {
            console.log("cannot edit the data");
        }
    } catch (error) {
        console.log("Cannot proceed to edit the data due to :-", error);
    }
}
//continous Fetch the crypto prices every 5 second
// cron.schedule('*/5 * * * * *', async () => {
//     const response = await FetchAllCrypto();
//     if (response.status === 200) {
//         console.log(response.data);
//     } else {
//         console.log("Failed");
//     }
// });

// Start the server and listen on the specified port
app.listen(process.env.PORT, () => {
    console.log("App is listening on port", process.env.PORT);
});
