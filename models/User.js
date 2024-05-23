const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    phone_number: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
    },
    otpExpires: {
        type: Date,
    }
});

module.exports = mongoose.model("Users", UserSchema);