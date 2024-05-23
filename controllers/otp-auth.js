const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post('/request-otp', async (req, res) => {

    const { phone_number } = req.body;                                           // We will get phone_number from the frontend

    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();          // I am generating 4-digit OTP

        const url = `https://www.fast2sms.com/dev/bulkV2`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'authorization': process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                route: 'otp',
                variables_values: otp,
                flash: 0,
                numbers: phone_number
            })
        });

        const result = await response.json();
        //console.log(result);

        if (result.return) {

            const user = await User.findOneAndUpdate(                           // For phone number, I am creating an otp, which is available for 45 seconds only
                { phone_number },
                { otp, otpExpires: new Date(Date.now() + 45*1000) },            // OTP expires in 45 seconds.
                { upsert: true, new: true }
            );

            res.status(200).json({ message: 'OTP sent successfully' });
        } 
        else {
            console.log(result.json);
            res.status(500).json({ message: 'Failed to send OTP' });
        }

    } 
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/verify-otp', async (req, res) => {

    const { phoneNumber, otp } = req.body;

    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: 'OTP is Invalid' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.otp = null;                                                        // Removing otp values that are stored with that phone number in database
        user.otpExpires = null;

        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
