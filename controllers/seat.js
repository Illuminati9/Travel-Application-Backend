const mongoose = require('mongoose')
const fs = require('fs')

const BusModel = require('../models/bus')
const BusDetailsModel = require('../models/busDetails')
const OwnerModel = require('../models/ownerDetails')
const StaffModel = require('../models/staff')
const UserModel = require('../models/user')
const AddressModel = require('../models/address')
const SeatModel = require('../models/seat')
const StopModel = require('../models/stop')
const TravelModel = require('../models/travel')

//! Seats Controllers for Bus

exports.createSeats = async (req, res) => {
    try {
        const { seatCapacity, seatArray } = req.body;
        const { busId, travelId } = req.params || req.query;
        const { id } = req.user;
        if (!busId || !seatCapacity || !seatArray || !travelId) {
            return res.status(400).json({
                success: false,
                message: "Please give required details",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Bus ID",
            })
        }

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Travel ID",
            })
        }


        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        if (user.accountType != Owner) {
            return res.status(400).json({
                success: false,
                message: "You are not an owner",
            })
        }


        const bus = await BusModel.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus Not Found",
            })
        }

        if (bus.ownerId.toString() != id) {
            return res.status(400).json({
                success: false,
                message: "You are not the owner of the bus",
            })
        }

        const travel = await TravelModel.findById(travelId);
        if (!travel) {
            return res.status(404).json({
                success: false,
                message: "Travel Not Found",
            })
        }

        let seatsArray = [];
        for (var seat in seatArray) {
            const { number, seatPlace, seatType } = seat;
            if (!number || !seatPlace || !seatType) {
                return res.status(400).json({
                    success: false,
                    message: "Please give required seat details",
                });
            }
            const seatInstance = await SeatModel.create(
                {   
                    number: number,
                    seatPlace: seatPlace,
                    seatType: seatType,
                    busId,
                    travelId,
                    travelDate: travel.departure
                }
            )

            seatsArray.push(seatInstance);
        }
        travel.seats = seatsArray;
        travel.seatCapacity = seatCapacity;
        await travel.save();
        bus.seatCapacity = seatCapacity;
        await bus.save();

        return res.status(201).json({
            success: true,
            message: "Seats Created Successfully",
            seats: seatsArray,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Creating Seats",
            error: error.message,
        })
    }
}

exports.getSeats = async (req, res) => {
    try {
        const { travelId } = req.params || req.query;
        if (!travelId) {
            return res.status(400).json({
                success: false,
                message: "Please give required details",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Bus ID",
            })
        }

        const travelDetails = await TravelModel.findById(travelId).populate('seats').exec();
        if (!travelDetails) {
            return res.status(404).json({
                success: false,
                message: "Bus Not Found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Seats Fetched Successfully",
            travelDetails,
            seats: travelDetails.seats,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Fetching Seats",
            error: error.message,
        })
    }
}


exports.editSeats = async (req, res) => {
    try {
        const { seatCapacity, seatArray } = req.body;
        const { busId, travelId } = req.params || req.query;
        const { id } = req.user;
        if (!busId || !seatCapacity || !seatArray || !travelId) {
            return res.status(400).json({
                success: false,
                message: "Please give required details",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Bus ID",
            })
        }

        if (!mongoose.Types.ObjectId.isValid(travelId)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Travel ID",
            })
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            })
        }

        if (user.accountType != Owner) {
            return res.status(400).json({
                success: false,
                message: "You are not an owner",
            })
        }

        const bus = await BusModel.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus Not Found",
            })
        }

        if (bus.ownerId.toString() != id) {
            return res.status(400).json({
                success: false,
                message: "You are not the owner of the bus",
            })
        }

        const travel = await TravelModel.findById(travelId);
        if (!travel) {
            return res.status(404).json({
                success: false,
                message: "Travel Not Found",
            })
        }

        for (var seatId in travel.seats) {
            await SeatModel.deleteOne({ _id: seatId });
        }

        let seatsArray = [];
        for (var seat in seatArray) {
            const { number, seatPlace, seatType } = seat;
            if (!number || !seatPlace || !seatType) {
                return res.status(400).json({
                    success: false,
                    message: "Please give required seat details",
                });
            }
            const seatInstance = await SeatModel.create(
                {
                    number: number,
                    seatPlace: seatPlace,
                    seatType: seatType,
                    busId,
                    travelId
                }
            )

            seatsArray.push(seatInstance);
        }

        travel.seats = seatsArray;
        travel.seatCapacity = seatCapacity;
        await travel.save();
        bus.seatCapacity = seatCapacity;
        await bus.save();

        return res.status(200).json({
            success: true,
            message: "Seats Edited Successfully",
            seats: seatsArray,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Editing Seats",
            error: error.message,
        })
    }
}
