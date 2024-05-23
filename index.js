const express = require('express');
const app = express();

const mongoDB = require("./db");


app.use(express.json());
mongoDB();

app.use('/api', require("./controllers/otp-auth"));

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});