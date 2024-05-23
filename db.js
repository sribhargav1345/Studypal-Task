const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const mongoDB = async() => {

    const USERNAME = process.env.DB_USERNAME;
    const PASSWORD = process.env.DB_PASSWORD;

    /* I made some percentage encoding in password */

    const mongoURL = `mongodb+srv://${USERNAME}:${PASSWORD}@studypal.wpzgf76.mongodb.net/?retryWrites=true&w=majority&appName=Studypal`;

    try{
        await mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});

        console.log("Connected to MongoDB");
    }
    catch(err){
        console.log("Problem connecting Database", err);
    }
}

module.exports = mongoDB;