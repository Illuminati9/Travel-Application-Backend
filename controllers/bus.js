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

const { Owner } = require('../utils/enumTypes')
const { busS3Url, allowedFileTypes } = require('../utils/constants')
const { uploadImageToS3_Type2, getObjectUrl } = require('../config/s3Server')

exports.createBus = async (req, res) => {
    try {
        let { name, number, seatCapacity, sourceStop, destinationStop, parkingAddress, busDetails } = req.body;
        if(typeof(parkingAddress) =='string'){
            parkingAddress = JSON.parse(parkingAddress);
        }
        if(typeof(busDetails) =='string'){
            busDetails = JSON.parse(busDetails);
        }
        const { street, city, state, country, pincode } = parkingAddress;
        const { busType, capacity, fuelType, fuelCapacity } = busDetails;
        const { certificates } = req.files;

        if (!name || !number || !seatCapacity || !sourceStop || !destinationStop || !parkingAddress || !busDetails) {
            return res.status(400).json({
                success: false,
                message: "Please give required details"
            })
        }

        if (!busType || !capacity || !certificates || !fuelType || !fuelCapacity) {
            return res.status(400).json({
                success: false,
                message: "Please give required bus details"
            })
        }

        if (!street || !city || !state || !country || !pincode) {
            return res.status(400).json({
                success: false,
                message: "Please give required parking address details"
            })
        }

        const numberPattern = /^[A-Za-z]{2}\s\d{2}\s[A-Za-z]{2}\s\d{4}$/;
        if (!numberPattern.test(number)) {
            return res.status(400).json({
                success: false,
                message: "Registration Number of the Bus doen't follow the norms",
            })
        }

        const busInstance1 = await BusModel.findOne({number});
        if(busInstance1){
            return res.status(400).json({
                success: false,
                message: "Bus with this number already exists"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(sourceStop) || !mongoose.Types.ObjectId.isValid(destinationStop)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Stop ID",
            })
        }

        const sourceStopInstance = await StopModel.findById(sourceStop);
        const destinationStopInstance = await StopModel.findById(destinationStop);
        if (!sourceStopInstance || !destinationStopInstance) {
            return res.status(404).json({
                success: false,
                message: "Stop Not Found",
            })
        }

        const pincodePattern = /^\d{6}$/;
        if (!pincodePattern.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Pincode",
            })
        }

        const { id } = req.user;

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }

        if (user.accountType != Owner) {
            return res.status(400).json({
                success: false,
                message: "You are not an owner"
            })
        }

        const owner = await OwnerModel.findById(user.ownerDetails);
        if (!owner) {
            return res.status(404).json({
                success: false,
                message: "Owner Not Found"
            })
        }

        const certificatesArray = [];
        for (const certificate of certificates) {
            const filePath = `${busS3Url}/${id}/${certificate.name}`;
            const fileStream = fs.createReadStream(certificate.tempFilePath);

            if (!fileStream) {
                return res.status(404).json({
                    success: false,
                    message: "Failed to upload certificate"
                })
            }

            if (!allowedFileTypes.includes(certificate.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid File Type"
                })
            }

            await uploadImageToS3_Type2({
                filePath: filePath,
                contentType: certificate.mimetype,
                body: fileStream
            })

            const imageUrl = await getObjectUrl(filePath)

            if (!imageUrl) {
                return res.status(404).json({
                    success: false,
                    message: "Failed to upload certificate"
                })
            }

            certificatesArray.push(imageUrl);
        }

        console.log(certificatesArray);

        // return res.status(200).json({
        //     success: true,
        //     message: "Certificates Uploaded Successfully",
        //     certificates: certificatesArray
        // });


        const addressInstance = await AddressModel.create({
            street, city, state, country, pincode
        })

        let busDetailsInstance = await BusDetailsModel.create({
            busType, capacity, certificates: certificatesArray, fuelType, fuelCapacity
        });

        const busInstance = await BusModel.create({
            name,
            number,
            seatCapacity,
            sourceStop,
            destinationStop,
            parkingAddress: addressInstance._id,
            busDetails: busDetailsInstance._id,
            ownerId: user._id,
        })

        busDetailsInstance.busId = busInstance._id;

        await busDetailsInstance.save();
        await busInstance.save();

        owner.buses.push(busInstance._id);
        await owner.save();

        let bus = await BusModel.findById(busInstance._id).populate('sourceStop').populate('destinationStop').populate('parkingAddress').populate('busDetails').exec();

        return res.status(201).json({
            success: true,
            message: "Bus Created Successfully",
            bus: bus,
            busDetails,
            address: addressInstance
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            error: error.message,
            message: "An Error Occurred While Creating Bus",
        })
    }
}

exports.getBuses = async (req, res) => {
    try {
        const buses = await BusModel.find().populate('sourceStop').populate('destinationStop').populate('stops').populate('parkingAddress').populate('busDetails').exec();

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
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Fetching Buses",
            error: error.message,
        })
    }
}

exports.getBus = async (req, res) => {
    try {
        const { id } = req.params || req.body ||  req.query;
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

        const bus = await BusModel.findById(id).populate('sourceStop').populate('destinationStop').populate('stops').populate('parkingAddress').populate('busDetails').exec();

        return res.status(200).json({
            success: true,
            message: "Bus Fetched Successfully",
            bus,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Fetching Bus",
            error: error.message,
        })
    }
}

//! Stop Controllers for Bus

exports.addStops = async (req, res) => {
    try {
        const { stops } = req.body;
        const { busId } = req.params || req.query;
        const { id } = req.user;

        if (!stops || !busId) {
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


        const stopsArray = [];
        for (let i=0;i<stops.length;i++) {
            let stopId = Object(stops[i]);
            const stopInstance = await StopModel.findById(stopId);
            if (!stopInstance) {
                return res.status(404).json({
                    success: false,
                    message: "Stop Not Found",
                })
            }

            stopsArray.push(stopInstance._id);
        }

        bus.stops = stopsArray;
        await bus.save();

        return res.status(201).json({
            success: true,
            message: "Stops Added Successfully",
            stops: stopsArray,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Adding Stops",
            error: error.message,
        })
    }
}

exports.getStops = async (req, res) => {
    try {
        const { busId } = req.params || req.query;
        // const {id} = req.user;

        if (!busId) {
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

        const bus = await BusModel.findById(busId).populate('stops').exec();
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus Not Found",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Stops Fetched Successfully",
            bus,
            stops: bus.stops,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Fetching Stops",
            error: error.message,
        })
    }
}

exports.editStops = async (req, res) => {
    try {
        const { stops } = req.body;
        const { busId } = req.params || req.query;
        const { id } = req.user;
        if (!stops || !busId) {
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

        if (user.ownerDetails.toString() != id) {
            return res.status(400).json({
                success: false,
                message: "You are not the owner of the bus",
            })
        }

        const bus = await BusModel.findById(busId);
        if (!bus) {
            return res.status(404).json({
                success: false,
                message: "Bus Not Found",
            })
        }

        const stopsArray = [];
        for (var stop in stops) {
            const stopInstance = await StopModel.findById(stop);
            if (!stopInstance) {
                return res.status(404).json({
                    success: false,
                    message: "Stop Not Found",
                })
            }
            stopsArray.push(stopInstance._id);
        }

        bus.stops = stopsArray;
        await bus.save();

        return res.status(200).json({
            success: true,
            message: "Stops Edited Successfully",
            stops: stopsArray,
            bus
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Editing Stops",
            error: error.message,
        })
    }
}