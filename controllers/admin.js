const mongoose = require("mongoose");

const UserModel = require("../models/user");
const ProfileModel = require("../models/profile");
const TicketModel = require("../models/ticket");
const BookingModel = require("../models/booking");
const BusModel = require("../models/bus");

const { Admin, User, Staff, Owner } = require("../utils/enumTypes");

//! User Controllers

exports.getUsers = async (req, res) => {
  try {
    const users = await UserModel.find(
      { accountType: { $ne: process.env.ADMIN_ROLE } },
      { password: 0 }
    )
      .populate("additionalDetails")
      .exec();

    if (!users) {
      return res.status(400).json({
        success: true,
        message: "No Users Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Users Fetched Successfully",
      users,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Users",
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params || req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const user = await UserModel.findOne({ _id: id }, { password: 0 })
      .populate("additionalDetails")
      .exec();
    if (!user) {
      return res.status(400).json({
        success: true,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching User",
      error: error.message,
    });
  }
};

exports.getUserBasedPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body || req.query || req.params;
    console.log(phoneNumber, "d;fa;lkjdfl;kj falksjdfl asdlkfjn;aksjdm cs;df");
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone Number is Required",
      });
    }

    const regex = new RegExp(phoneNumber, "i"); // 'i' flag for case-insensitive match

    const users = await UserModel.find(
      { phoneNumber: regex, accountType: { $ne: process.env.ADMIN_ROLE } },
      { password: 0 }
    )
      .populate("additionalDetails")
      .exec();
    if (!users) {
      return res.status(400).json({
        success: true,
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Fetched Successfully",
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching User",
      error: error.message,
    });
  }
};

//! Owner Controllers

exports.getOwners = async (req, res) => {
  try {
    const users = await UserModel.find(
      { accountType: process.env.OWNER_ROLE },
      { password: 0 }
    );

    if (!users) {
      return res.status(400).json({
        success: true,
        message: "No Owners Found",
      });
    }
    const finalUsers = [];
    for (let i = 0; i < users.length; i++) {
      const user = await UserModel.findOne(
        { _id: users[i]._id },
        { password: 0 }
      )
        .populate("ownerDetails")
        .populate("additionalDetails")
        .exec();

      finalUsers.push(user);
    }

    return res.status(200).json({
      success: true,
      message: "Owners Fetched Successfully",
      users: finalUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Owners",
      error: error.message,
    });
  }
};

exports.getOwnerById = async (req, res) => {
  try {
    const { id } = req.params || req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is Required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Owner ID",
      });
    }

    const user = await UserModel.findOne({ _id: id })
      .populate("ownerDetails")
      .populate("additionalDetails")
      .exec();
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Owner Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Owner Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getOwnerBasedOnName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Owner name is required",
        success: false,
      });
    }

    const owner = await Owner.find({
      name: {
        $regex: name,
        $options: "i",
      },
    }).exec();

    if (!owner) {
      return res.status(404).json({
        message: "Owner not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Owner fetched successfully",
      success: true,
      owner,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
};

//! Booking Controllers

exports.getBookingsBasedOnPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.body || req.params;
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone Number is Required",
      });
    }

    const phoneNumberPattern = /^\d{10}$/;
    if (!phoneNumberPattern.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Phone Number",
      });
    }

    const user = await UserModel.findOne({ phoneNumber: phoneNumber });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    const bookings = await BookingModel.find({ userId: user._id })
      .populate("ticketId")
      .exec();
    if (!bookings) {
      return res.status(400).json({
        success: false,
        message: "No Bookings Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings Fetched Successfully",
      bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Bookings",
      error: error.message,
    });
  }
};

exports.getBookingsBasedOnUserId = async (req, res) => {
  try {
    const { userId } = req.body || req.params || req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is Required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
      });
    }

    const bookings = await BookingModel.find({ userId: userId })
      .populate("ticketId")
      .exec();
    if (!bookings) {
      return res.status(400).json({
        success: true,
        message: "No Bookings Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookings Fetched Successfully",
      bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Bookings",
      error: error.message,
    });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const { id } = req.body || req.params || req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is Required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking ID",
      });
    }

    const booking = await BookingModel.findById(id)
      .populate("ticketId")
      .populate("userId")
      .exec();

    if (!booking) {
      return res.status(200).json({
        success: true,
        message: "Booking Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking Fetched Successfully",
      booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Booking",
      error: error.message,
    });
  }
};

//! Bus Routes
exports.getBuses = async (req, res) => {
  try {
    const buses = await BusModel.find({});
    if (!buses) {
      return res.status(400).json({
        success: true,
        message: "No Buses Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Buses Fetched Successfully",
      buses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Buses",
      error: error.message,
    });
  }
};

exports.getBusById = async (req, res) => {
  try {
    const { id } = req.params || req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Bus ID is Required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Bus ID",
      });
    }

    const bus = await BusModel.findById(id)
      .populate("sourceStop")
      .populate("destinationStop")
      .populate("stops")
      .populate("parkingAddress")
      .populate("staffId")
      .populate("busDetails")
      .exec();

    if (!bus) {
      return res.status(200).json({
        success: true,
        message: "Bus Not Found",
      });
    }

    const owner = await UserModel.findById(bus.ownerId, { password: 0 })
      .populate("ownerDetails")
      .exec();
    bus.ownerId = null;

    return res.status(200).json({
      success: true,
      message: "Bus Fetched Successfully",
      bus,
      owner,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Bus",
      error: error.message,
    });
  }
};

exports.getSourceStops = async (req, res) => {
  try {
    const stops = await BusModel.find({}, { sourceStop: 1 });
    if (!stops) {
      return res.status(400).json({
        success: true,
        message: "No Stops Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stops Fetched Successfully",
      stops,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Stops",
      error: error.message,
    });
  }
};

exports.getDestinationStops = async (req, res) => {
  try {
    const stops = await BusModel.find({}, { destinationStop: 1 });
    if (!stops) {
      return res.status(400).json({
        success: true,
        message: "No Stops Found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stops Fetched Successfully",
      stops,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "An Error Occurred While Fetching Stops",
      error: error.message,
    });
  }
};
