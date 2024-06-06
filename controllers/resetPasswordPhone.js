const UserModel = require('../models/user')
const { User } = require('../utils/enumTypes')
const sendSMSPhone = require('../utils/smsSender')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

exports.resetPasswordTokenPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const user = await UserModel.findOne({ phoneNumber });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Your Phone Number is Not Registered With Us"
            })
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const updatedDetails = await UserModel.findOneAndUpdate({
            phoneNumber: phoneNumber
        }, {
            token: resetToken,
            resetTokenExpires: Date.now() + 5 * 60 * 1000
        }, {
            new: true
        })

        const url = `${process.env.FRONTEND_URL}/update-password/${resetToken}`;

        await sendSMSPhone(phoneNumber, `Password Reset Link: ${url}`);

        return res.status(200).json({
            success: true,
            message: "SMS Sent Successfully, Please Check The SMS And Change The Password"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong While Sending Reset Password Mail",
        });
    }
}

exports.resetPasswordPhone = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;

        if (!password || !confirmPassword || !token) {
            return res.status(403).json({
                success: false,
                message: "Please Provide All The Required Details"
            })
        }

        if (password !== confirmPassword) {
            return res.status(403).json({
                success: false,
                message: "Password And Confirm Password Do Not Match"
            })
        }

        const user = await UserModel.findOne({ token: token });
        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Invalid Token",
            });
        }

        if (user.resetTokenExpires < Date.now()) {
            return res.status(403).json({
                success: false,
                message: "Token Expired"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedDetails = await UserModel.findOneAndUpdate({
            token: token
        }, {
            password: hashedPassword,
            token: null,
            resetTokenExpires: null
        }, { new: true })

        return res.status(200).json({
            success: true,
            message: "Password Reset Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred",
            error: error.message
        })
    }
}