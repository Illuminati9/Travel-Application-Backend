const User = require("../models/user");
const OTP = require("../models/otp");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  passwordUpdated,
} = require("../templates/email/passwordUpdateTemplate");
require("dotenv").config();
const {generateOTP} = require('../utils/generateOTP');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const otp = await generateOTP();
    console.log("OTP generated:", otp);

    const otpPayload = { email, otp };

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
      otp,
    });
  } catch (error) {
    console.error("Error in sendOTP:", error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Sending OTP",
      error: error.message,
    });
  }
};

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "Please Fill in all the Required Fields to Sign up.",
      });
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please Provide a valid Email Address.",
      });
    }


    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not Match. Please Try Again.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is Already Registered.",
      });
    }

    const otpDigits = /^\d{6}$/;
    if (!otpDigits.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format. OTP should be a 6-digit number.",
      });
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

    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password Must be at least 8 characters long and Include at least one Uppercase Letter, one Lowercase Letter, one Digit, and one Special Character.",
      });
    }

    if (accountType == 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: "Invalid Account Type",
      });
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
      email,
      password: hashedPassword,
      accountType,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      additionalDetails: profileDetails._id
    });

    const userPayload = await User.findOne({ _id: user._id }, { password: 0 }).populate("additionalDetails").exec();

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



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Both Email and Password to Login.",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email Format. Please Provide a valid Email Address.",
      });
    }

    const user = await User.findOne({ email }, { password: 0,_id:0 })
      .populate("additionalDetails")
      .exec();

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

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Successfully.",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials. Please check your Email and Password.",
      });
    }
  } catch (error) {
    console.error("Error in login:", error);
    return res.status(500).json({
      success: false,
      message: "Login Failure. Please Try Again Later.",
      error: error.message,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userDetails = await User.findById(req.user.id);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Please Provide oldPassword, newPassword, and confirmPassword.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials. Please check your old password.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "The new password and confirm password do not match.",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "The new password should be different from the old password.",
      });
    }

    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    console.log(passwordPattern.test(newPassword));
    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password Must be at least 8 characters long and Include at least one Uppercase Letter, one Lowercase Letter, one Digit, and one Special Character.",
      });
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password Updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email Sent Successfully:", emailResponse.response);
    } catch (error) {
      console.error("Error Occurred While Sending Email:", error);
      return res.status(500).json({
        success: false,
        message: "Error Occurred While Sending Email",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.error("Error Occurred While Updating Password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while Updating Password",
      error: error.message,
    });
  }
};