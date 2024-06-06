const jwt = require("jsonwebtoken");
const { User, Owner, Admin, Staff } = require("../utils/enumTypes");
require("dotenv").config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("Bearer ", "") 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }
    console.log(token);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log(payload);
      req.user = payload;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating The Token",
    });
  }
};

exports.isUser = async (req, res, next) => {
  try {
    if (req.user.accountType !== User) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Users Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};

exports.isOwner = async (req, res, next) => {
  try {
    if (req.user.accountType !== Owner) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Owners Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};

exports.isStaff = async (req, res, next) => {
  try {
    if (req.user.accountType !== Staff) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Staff Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
}

exports.isAdmin = async (req, res, next) => {
  try {
    console.log(req.user.accountType);
    if (req.user.accountType !== Admin) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route For Admin Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User Role Cannot be Verified, Please Try Again",
    });
  }
};