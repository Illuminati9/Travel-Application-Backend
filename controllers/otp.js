const OTP = require("../models/otp");
const OTPPhone = require("../models/otpPhone");


exports.verifyOTPEmail = async(req,res)=>{
    try {
        const {email, otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const otpPattern = /^[0-9]{6}$/;

        if(!otpPattern.test(otp)){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number."
            })
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(!emailPattern.test(email)){
            return res.status(400).json({
                success: false,
                message: "Please Provide a valid Email Address."
            })
        }

        const recentOTP = await OTP.findOne({ email })
            .sort({ createdAt: -1 })
            .limit(1);
        if (!recentOTP || (recentOTP.length > 0 && recentOTP[0].otp !== otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully."
        });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message    
        })
    }
}

exports.verifyOTPPhone = async(req,res)=>{
    try {
        const {phoneNumber, otp} = req.body;
        if(!phoneNumber || !otp){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const phoneNumberPattern = /^\d{10}$/;
        if(!phoneNumberPattern.test(phoneNumber)){
            return res.status(400).json({
                success: false,
                message: "Invalid Phone Number format. Phone Number should be a 10-digit number."
            })
        }

        const otpPattern = /^[0-9]{6}$/;
        if(!otpPattern.test(otp)){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number."
            })
        }

        const recentOTP = await OTPPhone.findOne({ phoneNumber })
            .sort({ createdAt: -1 })
            .limit(1);
        if (!recentOTP || (recentOTP.length > 0 && recentOTP[0].otp !== otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP Verified Successfully."
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}