const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post('/request-otp', async (req, res) => {

    const { phone_number } = req.body;
    const code = "+91";
    
    try {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const url = `https://api.authkey.io/request?authkey=${process.env.AUTHKEY_API_KEY}&mobile=${phone_number}&country_code=${code}&sid=1001&name=Twinkle&otp=${otp}`;

        console.log(otp);
        console.log(process.env.AUTHKEY_API_KEY);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const responseData = await response.json();
        console.log(responseData);

        if (responseData.status === 'SUCCESS') {
            const user = await User.findOneAndUpdate(
                { phone_number },
                { otp, otpExpires: new Date(Date.now() + 30 * 1000) },
                { upsert: true, new: true }
            );

            res.status(200).json({ message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send OTP' });
        }

    } catch (error) {
        console.error(error);
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
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.otp = null;
        user.otpExpires = null;

        await user.save();

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
