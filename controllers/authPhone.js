const User = require("../models/user");
const OTPPhone = require("../models/otpPhone");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const { generateOTP } = require("../utils/generateOTP");

exports.sendOTPPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        const phoneNumberPattern = /^\d{10}$/;

        if (!phoneNumberPattern.test(phoneNumber)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Phone Number" });
        }

        const otp = await generateOTP();
        console.log("otp generated", otp);

        const newOTP = await OTPPhone.create({ phoneNumber, otp });

        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully to registered mobile number",
            newOTP
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            error: error.message,
            success: false,
            message: "Internal Server Error",
        });
    }
};

exports.signUpPhone = async (req, res) => {
    try {
        let {
            firstName,
            lastName,
            phoneNumber,
            password,
            confirmPassword,
            accountType,
            otp,
        } = req.body;
       
        if (!firstName || !lastName || !phoneNumber || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please Fill in all the Required Fields to Sign up.",
            });
        }

        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Phone Number",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not Match. Please Try Again.",
            });
        }

        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone Number is Already Registered.",
            });
        }

        const otpDigits = /^\d{6}$/;
        if (!otpDigits.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number.",
            });
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

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password Must be at least 8 characters long and Include at least one Uppercase Letter, one Lowercase Letter, one Digit, and one Special Character.",
            });
        }

        if (accountType == process.env.ADMIN_ROLE) {
            return res.status(400).json({
                success: false,
                message: "Invalid Account Type",
            });
        }

        if(accountType==null){
            accountType=process.env.USER_ROLE;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            // gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            phoneNumber,
            password: hashedPassword,
            accountType,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            additionalDetails: profileDetails._id,
        });

        const userPayload = await User.findOne({ _id: user._id }, { password: 0 });

        return res.status(200).json({
            success: true,
            message: "User is Registered Successfully",
            user: userPayload,
        });
    } catch (error) {
        console.error("Error in signUp:", error);
        return res.status(500).json({
            success: false,
            message: "User Cannot be Registered. Please Try Again.",
            error: error.message,
        });
    }
};

exports.generateAccessToken = async (userId) => {
    const user = await User.findOne({ _id: userId });
    const payload = {
        phoneNumber: user.phoneNumber,
        id: user._id,
        accountType: user.accountType,
    };
    console.log('payload',payload);
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    return token;
};

exports.generateRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secret = process.env.REFRESH_KEY;
        const options = {
            expiresIn: "30d",
            issuer: "travel_application",
            audience: userId.toString(),
        };
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) {
                reject("Error in generating refresh token");
            }
            resolve(token);
        });
    });
};

exports.loginUsingPhoneNumber = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        console.log(1)
        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please Provide Both Phone Number and OTP to Login.",
            });
        }
        console.log(1)

        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format",
            });
        }
        console.log(1)

        const otpDigits = /^\d{6}$/;
        if (!otpDigits.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number.",
            });
        }
        console.log(otp)
        const recentOTP = await OTPPhone.findOne({ phoneNumber })
            .sort({ createdAt: -1 })
            .limit(1);
        console.log(recentOTP.otp)
        if (!recentOTP || (recentOTP.length > 0 && recentOTP.otp !== otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP.",
            });
        }

        const user = await User.findOne({ phoneNumber },{password:0});

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials. User is not Registered. Please Sign up.",
            });
        }

        if (user.token) {
            return res.status(401).json({
                success: false,
                message: "User is Already logged in.",
            });
        }
        console.log(1)
        const token = await this.generateAccessToken(user._id);
        const refreshToken = await this.generateRefreshToken(user._id);
        console.log(token)
        user.token = token;
        user.password = undefined;

        const options = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
        };

        res.cookie("Travel_application_refresh", refreshToken, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
        });

        res.cookie("Travel_application_access", token, options).status(200).json({
            success: true,
            token,
            user,
            refreshToken,
            message: "Logged in Successfully.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Logging in",
            error: error.message,
        });
    }
};

exports.changePasswordPhone = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword, otp } = req.body;
        const userId = req.user.id;
        const phoneNumber = req.user.phoneNumber;
        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Phone Number",
            });
        }

        const otpPattern = /^\d{6}$/;
        if (!otpPattern.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number.",
            });
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

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not Match. Please Try Again.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found",
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Old Password",
            });
        }

        const isMatch2 = await bcrypt.compare(newPassword, user.password);
        if (isMatch2) {
            return res.status(400).json({
                success: false,
                message: "New Password cannot be same as Old Password",
            });
        }

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordPattern.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password Must be at least 8 characters long and Include at least one Uppercase Letter, one Lowercase Letter, one Digit, and one Special Character.",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Changed Successfully",
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Changing Password",
            error: error.message,
        });
    }
};

exports.forgotPasswordPhone = async (req, res) => {
    try {
        const { password, confirmPassword, otp, phoneNumber } = req.body;

        const phoneNumberPattern = /^\d{10}$/;
        if (!phoneNumberPattern.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Phone Number",
            });
        }

        const otpPattern = /^\d{6}$/;
        if (!otpPattern.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP format. OTP should be a 6-digit number.",
            });
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

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and Confirm Password do not Match. Please Try Again.",
            });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User Not Found",
            });
        }

        const passwordPattern =
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password Must be at least 8 characters long and Include at least one Uppercase Letter, one Lowercase Letter, one Digit, and one Special Character.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Changed Successfully",
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Forgot Password Method",
            error: error.message,
        });
    }
};

exports.refreshRoute = async (req, res) => {
    console.log("I am here ");
    try {
        const cookies = req.cookies;
        const refreshToken = cookies.Travel_application_refresh;

        if (!refreshToken) return res.sendStatus(401);

        const verifyRefreshToken = (refreshToken) => {
            return new Promise((resolve, reject) => {
                jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, payload) => {
                    if (err) {
                        reject("Invalid refresh token");
                    }
                    const userId = payload.aud;
                    resolve(userId);
                });
            });
        };

        const userId = await verifyRefreshToken(refreshToken);

        if (!userId) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        const accessToken = await this.generateAccessToken(userId);
        const refToken = await this.generateRefreshToken(userId);

        res.cookie("Travel_application_access", accessToken, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        res.cookie("Travel_application_refresh", refToken, {
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            secure: process.env.NODE_ENV === "production" ? true : false,
            httpOnly: process.env.NODE_ENV === "production" ? true : false,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({ AccessToken: accessToken, refreshToken: refToken });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid refresh token" });
        } else if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Refresh token expired" });
        } else {
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

exports.logout = (req, res) => {
    const cookies = req.cookies;
    console.log("This is the cookies", cookies)
    if (!cookies?.Travel_application_access) return res.sendStatus(204);

    res.clearCookie("Travel_application_refresh", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.clearCookie("Travel_application_access", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.sendStatus(204);
};
