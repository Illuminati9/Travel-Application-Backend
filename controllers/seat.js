const mongoose = require('mongoose')

const BusModel = require('../models/bus')
const BusDetailsModel = require('../models/busDetails')
const OwnerModel = require('../models/ownerDetails')
const StaffModel = require('../models/staff')
const UserModel = require('../models/user')
const AddressModel = require('../models/address')
const StopModel = require('../models/stop')
const TravelModel = require('../models/travel')
const SeatFloorModel = require('../models/seatFloor')
const SeatRowModel = require('../models/seatRow')
const SeatAvailableModel = require('../models/seatAvailable')
const SeatModel = require('../models/seat')
const { Owner, Lower, Upper } = require('../utils/enumTypes')

//! Seats Controllers for Bus

exports.createSeats = async (req, res) => {
    try {
        const { seatCapacity, lowerSeats, upperSeats } = req.body;
        const { busId, travelId } = req.params || req.query;
        const { id } = req.user;
        console.log(seatCapacity, lowerSeats, upperSeats, busId, travelId);
        if (!busId || !seatCapacity || !lowerSeats || !travelId) {
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

        if(travel.lowerSeats!=null || travel.upperSeats!=null){
            return res.status(400).json({
                success: false,
                message: "Seats Already Created",
            })
        }

        for (let i = 0; i < lowerSeats.length; i++) {
            // console.log(lowerSeats[i], 'hello world lower');
            for (let j = 0; j < lowerSeats[i].length; j++) {
                const { isEmptySpace, seatNumber, seatPlace, seatType } = lowerSeats[i][j];
                console.log(isEmptySpace, seatNumber, seatPlace, seatType);
                if (!isEmptySpace) {
                    if (!seatNumber || !seatPlace || !seatType) {
                        return res.status(400).json({
                            success: false,
                            message: "Please give required seat details",
                        });
                    }
                }
            }
        }

        if (upperSeats != null) {
            for (let i = 0; i < upperSeats.length; i++) {
                // console.log(upperSeats[i], 'hello world lower');
                for (let j = 0; j < upperSeats[i].length; j++) {
                    const { isEmptySpace, seatNumber, seatPlace, seatType } = upperSeats[i][j];
                    console.log(isEmptySpace, seatNumber, seatPlace, seatType);
                    if (!isEmptySpace) {
                        if (!seatNumber || !seatPlace || !seatType) {
                            return res.status(400).json({
                                success: false,
                                message: "Please give required seat details",
                            });
                        }
                    }
                }
            }
        }

        let lowerSeatsRowsArray = [];
        const lowerSeatFloorInstance = await SeatFloorModel.create({
            seatFloor: Lower,
            busId
        });
        for (let i = 0; i < lowerSeats.length; i++) {
            let lowerSeatsArray = [];
            const seatRowInstance = await SeatRowModel.create({
                busId
            });
            for (let j = 0; j < lowerSeats[i].length; j++) {
                const { isEmptySpace } = lowerSeats[i][j];
                const seatAvailableInstance = await SeatAvailableModel.create({
                    isEmptySpace
                });
                if (!isEmptySpace) {
                    const { seatNumber, seatPlace, seatType } = lowerSeats[i][j];
                    const seatInstance = await SeatModel.create(
                        {
                            number: seatNumber,
                            seatPlace: seatPlace,
                            seatType: seatType,
                            seatFloor: Lower,
                            seatAvailableId: seatAvailableInstance._id,
                            seatRowId: seatRowInstance._id,
                            seatFloorId: lowerSeatFloorInstance._id,
                            busId,
                            travelId,
                            travelDate: Date.parse(travel.departure)
                        }
                    );
                    seatAvailableInstance.seat = seatInstance._id;
                    await seatAvailableInstance.save();
                }
                lowerSeatsArray.push(seatAvailableInstance._id);
            }
            seatRowInstance.seats = lowerSeatsArray;
            await seatRowInstance.save();
            lowerSeatsRowsArray.push(seatRowInstance._id);
        }
        lowerSeatFloorInstance.rows = lowerSeatsRowsArray;
        await lowerSeatFloorInstance.save();

        travel.lowerSeats = lowerSeatFloorInstance._id;
        await travel.save();

        if (upperSeats != null) {
            let upperSeatsRowsArray = [];
            const upperSeatFloorInstance = await SeatFloorModel.create({
                seatFloor: Upper,
                busId
            });
            for (let i = 0; i < upperSeats.length; i++) {
                let upperSeatsArray = [];
                const seatRowInstance = await SeatRowModel.create({
                    busId
                });
                for (let j = 0; j < upperSeats[i].length; j++) {
                    const { isEmptySpace } = upperSeats[i][j];
                    const seatAvailableInstance = await SeatAvailableModel.create({
                        isEmptySpace
                    });
                    if (!isEmptySpace) {
                        const { seatNumber, seatPlace, seatType } = upperSeats[i][j];
                        const seatInstance = await SeatModel.create(
                            {
                                number: seatNumber,
                                seatPlace: seatPlace,
                                seatType: seatType,
                                seatFloor: Upper,
                                seatAvailableId: seatAvailableInstance._id,
                                seatRowId: seatRowInstance._id,
                                seatFloorId: upperSeatFloorInstance._id,
                                busId,
                                travelId,
                                travelDate: Date.parse(travel.departure)
                            }
                        );
                        seatAvailableInstance.seat = seatInstance._id;
                        await seatAvailableInstance.save();
                    }
                    upperSeatsArray.push(seatAvailableInstance._id);
                }
                seatRowInstance.seats = upperSeatsArray;
                await seatRowInstance.save();
                upperSeatsRowsArray.push(seatRowInstance._id);
            }
            upperSeatFloorInstance.rows = upperSeatsRowsArray;
            await upperSeatFloorInstance.save();
            travel.upperSeats = upperSeatFloorInstance._id;
            await travel.save();
        }

        // const {lowerSeats, upperSeats} = seatArray;
        // for(var seat in lowerSeats){
        //     const { number, seatPlace, seatType, seatFloor,isSeatAvailable } = seat;
        //     if(isSeatAvailable){
        //         if (!number || !seatPlace || !seatType) {
        //             return res.status(400).json({
        //                 success: false,
        //                 message: "Please give required seat details",
        //             });
        //         }
        //     }
        // }

        // if(upperSeats !=null){
        //     for(var seat in upperSeats){
        //         const { number, seatPlace, seatType, seatFloor,isSeatAvailable } = seat;
        //         if(isSeatAvailable){
        //             if (!number || !seatPlace || !seatType) {
        //                 return res.status(400).json({
        //                     success: false,
        //                     message: "Please give required seat details",
        //                 });
        //             }
        //         }
        //     }
        // }

        // let lowerSeatsArray = [];
        // for (var seat in lowerSeats) {
        //     const { isSeatAvailable, number, seatPlace, seatType,seatFloor } = seat;
        //     let seatInstance = {isSeatAvailable: false, seat: null};
        //     if(isSeatAvailable){
        //         if(!seatFloor){
        //             seatFloor = Lower;
        //         }
        //         seatInstance.seat = await SeatModel.create(
        //             {   
        //                 number: number,
        //                 seatPlace: seatPlace,
        //                 seatType: seatType,
        //                 seatFloor: seatFloor,
        //                 busId,
        //                 travelId,
        //                 travelDate: Date.parse(travel.departure)
        //             }
        //         );
        //     }else{
        //         seatInstance = {isSeatAvailable: false, seat: null};
        //     }
        //     lowerSeatsArray.push(seatInstance);
        // }

        // let upperSeatsArray = [];
        // if(upperSeats != null){
        //     for (var seat in upperSeats) {
        //         const { isSeatAvailable, number, seatPlace, seatType,seatFloor } = seat;
        //         let seatInstance = {isSeatAvailable: false, seat: null};
        //         if(isSeatAvailable){
        //             if(!seatFloor){
        //                 seatFloor = Upper;
        //             }
        //             seatInstance.isSeatAvailable = true;
        //             seatInstance.seat = await SeatModel.create(
        //                 {   
        //                     number: number,
        //                     seatPlace: seatPlace,
        //                     seatType: seatType,
        //                     seatFloor: seatFloor,
        //                     busId,
        //                     travelId,
        //                     travelDate: Date.parse(travel.departure)
        //                 }
        //             );
        //         }else{
        //             seatInstance = {isSeatAvailable: false, seat: null};
        //         }
        //         upperSeatsArray.push(seatInstance);
        //     }
        //     lowerSeatsArray = lowerSeatsArray.concat(upperSeatsArray);
        // }

        // let seatsArray = {lowerSeatsArray, upperSeatsArray};
        // travel.seats = seatsArray;
        // travel.seatCapacity = seatCapacity;
        // await travel.save();
        // bus.seatCapacity = seatCapacity;
        // await bus.save();

        return res.status(201).json({
            success: true,
            message: "Seats Created Successfully",
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

        let travelDetails = await TravelModel.findById(travelId).populate('busId').populate('source').populate('destination').exec();
        if (!travelDetails) {
            return res.status(404).json({
                success: false,
                message: "Travel Not Found",
            })
        }

        if (travelDetails.lowerSeats == null) {
            return res.status(200).json({
                success: true,
                message: "No Seats Available",
                travelDetails,
                seats: null,
            });
        }

        let lowerSeatsDetails = await SeatFloorModel.findById(travelDetails.lowerSeats).populate({ path: 'rows', populate: { path: 'seats' } }).exec();
        travelDetails.lowerSeats = lowerSeatsDetails;

        for(var i=0;i<lowerSeatsDetails.rows.length;i++){
            for(var j=0;j<lowerSeatsDetails.rows[i].seats.length;j++){
                const {isEmptySpace} = lowerSeatsDetails.rows[i].seats[j];
                if(!isEmptySpace){
                    let seat = await SeatModel.findById(lowerSeatsDetails.rows[i].seats[j].seat);
                    lowerSeatsDetails.rows[i].seats[j].seat = seat;
                }
            }
        }

        if (travelDetails.upperSeats != null) {
            let upperSeatsDetails = await SeatFloorModel.findById(travelDetails.upperSeats).populate({
                path: 'rows',
                populate: {
                    path: 'seats'
                }
            }).exec();
            travelDetails.upperSeats = upperSeatsDetails;

            for(var i=0;i<upperSeatsDetails.rows.length;i++){
                for(var j=0;j<upperSeatsDetails.rows[i].seats.length;j++){
                    const {isEmptySpace} = upperSeatsDetails.rows[i].seats[j];
                    if(!isEmptySpace){
                        let seat = await SeatModel.findById(upperSeatsDetails.rows[i].seats[j].seat);
                        upperSeatsDetails.rows[i].seats[j].seat = seat;
                    }
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: "Seats Fetched Successfully",
            travelDetails,
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
        const { seatCapacity, lowerSeats, upperSeats } = req.body;
        const {  travelId } = req.params || req.query;
        const { id } = req.user;
        console.log("hell world")
        if ( !seatCapacity || !lowerSeats || !travelId) {
            return res.status(400).json({
                success: false,
                message: "Please give required details",
            });
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

        const travel = await TravelModel.findById(travelId).populate({
            path: 'lowerSeats',
            populate: {
                path: 'rows',
                populate: {
                    path: 'seats'
                }
            }
        }).populate({
            path: 'upperSeats',
            populate: {
                path: 'rows',
                populate: {
                    path: 'seats'
                }
            }
        }).exec();
        const bus = await BusModel.findById(travel.busId);

        if(bus.ownerId.toString() != id){
            return res.status(400).json({
                success: false,
                message: "You are not the owner of the bus",
            })
        }

        if (!travel) {
            return res.status(404).json({
                success: false,
                message: "Travel Not Found",
            })
        }

        if (travel.lowerSeats == null) {
            return res.status(200).json({
                success: true,
                message: "No Seats Available",
                travel,
                seats: null,
            });
        }
       
        for(var i=0;i<travel.lowerSeats.rows.length;i++){
            for(var j=0;j<travel.lowerSeats.rows[i].seats.length;j++){
                const {isEmptySpace} = travel.lowerSeats.rows[i].seats[j];
                if(!isEmptySpace){
                    await SeatModel.deleteOne({_id: travel.lowerSeats.rows[i].seats[j].seat});
                    lowerSeats[i][j].seat = null;
                }
                await SeatAvailableModel.deleteOne({_id: travel.lowerSeats.rows[i].seats[j]._id});
            }
            await SeatRowModel.deleteOne({_id: travel.lowerSeats.rows[i]._id});
        }
        await SeatFloorModel.deleteOne({_id: travel.lowerSeats._id});


        if(upperSeats != null){
            for(var i=0;i<travel.upperSeats.rows.length;i++){
                for(var j=0;j<travel.upperSeats.rows[i].seats.length;j++){
                    const {isEmptySpace} = travel.upperSeats.rows[i].seats[j];
                    if(!isEmptySpace){
                        await SeatModel.deleteOne({_id: travel.upperSeats.rows[i].seats[j].seat});
                        upperSeats[i][j].seat = null;
                    }
                    await SeatAvailableModel.deleteOne({_id: travel.upperSeats.rows[i].seats[j]._id});
                }
                await SeatRowModel.deleteOne({_id: travel.upperSeats.rows[i]._id});
            }
            await SeatFloorModel.deleteOne({_id: travel.upperSeats._id});
        }

        console.log('Hello world');

        let lowerSeatsRowsArray = [];
        const lowerSeatFloorInstance = await SeatFloorModel.create({
            seatFloor: Lower,
            busId: travel.busId
        });
        for (let i = 0; i < lowerSeats.length; i++) {
            let lowerSeatsArray = [];
            const seatRowInstance = await SeatRowModel.create({
                busId: travel.busId
            });
            for (let j = 0; j < lowerSeats[i].length; j++) {
                const { isEmptySpace } = lowerSeats[i][j];
                const seatAvailableInstance = await SeatAvailableModel.create({
                    isEmptySpace
                });
                if (!isEmptySpace) {
                    const { seatNumber, seatPlace, seatType } = lowerSeats[i][j];
                    const seatInstance = await SeatModel.create(
                        {
                            number: seatNumber,
                            seatPlace: seatPlace,
                            seatType: seatType,
                            seatFloor: Lower,
                            seatAvailableId: seatAvailableInstance._id,
                            seatRowId: seatRowInstance._id,
                            seatFloorId: lowerSeatFloorInstance._id,
                            busId: travel.busId,
                            travelId,
                            travelDate: Date.parse(travel.departure)
                        }
                    );
                    seatAvailableInstance.seat = seatInstance._id;
                    await seatAvailableInstance.save();
                }
                lowerSeatsArray.push(seatAvailableInstance._id);
            }
            seatRowInstance.seats = lowerSeatsArray;
            await seatRowInstance.save();
            lowerSeatsRowsArray.push(seatRowInstance._id);
        }

        lowerSeatFloorInstance.rows = lowerSeatsRowsArray;
        await lowerSeatFloorInstance.save();

        travel.lowerSeats = lowerSeatFloorInstance._id;
        await travel.save();

        if (upperSeats != null) {
            let upperSeatsRowsArray = [];
            const upperSeatFloorInstance = await SeatFloorModel.create({
                seatFloor: Upper,
                busId: travel.busId
            });
            for (let i = 0; i < upperSeats.length; i++) {
                let upperSeatsArray = [];
                const seatRowInstance = await SeatRowModel.create({
                    busId: travel.busId
                });
                for (let j = 0; j < upperSeats[i].length; j++) {
                    const { isEmptySpace } = upperSeats[i][j];
                    const seatAvailableInstance = await SeatAvailableModel.create({
                        isEmptySpace
                    });
                    if (!isEmptySpace) {
                        const { seatNumber, seatPlace, seatType } = upperSeats[i][j];
                        const seatInstance = await SeatModel.create(
                            {
                                number: seatNumber,
                                seatPlace: seatPlace,
                                seatType: seatType,
                                seatFloor: Upper,
                                seatAvailableId: seatAvailableInstance._id,
                                seatRowId: seatRowInstance._id,
                                seatFloorId: upperSeatFloorInstance._id,
                                busId: travel.busId,
                                travelId,
                                travelDate: Date.parse(travel.departure)
                            }
                        );
                        seatAvailableInstance.seat = seatInstance._id;
                        await seatAvailableInstance.save();
                    }
                    upperSeatsArray.push(seatAvailableInstance._id);
                }
                seatRowInstance.seats = upperSeatsArray;
                await seatRowInstance.save();
                upperSeatsRowsArray.push(seatRowInstance._id);
            }
            upperSeatFloorInstance.rows = upperSeatsRowsArray;
            await upperSeatFloorInstance.save();
            travel.upperSeats = upperSeatFloorInstance._id;
            await travel.save();
        }


        return res.status(200).json({
            success: true,
            message: "Seats Edited Successfully",
            seats: travel,
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


exports.deleteSeats = async(req,res)=>{
    try {
        const { seatCapacity, lowerSeats, upperSeats } = req.body;
        const {  travelId } = req.params || req.query;
        const { id } = req.user;
        
        if ( !seatCapacity || !lowerSeats || !travelId) {
            return res.status(400).json({
                success: false,
                message: "Please give required details",
            });
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

        const travel = await TravelModel.findById(travelId).populate({
            path: 'lowerSeats',
            populate: {
                path: 'rows',
                populate: {
                    path: 'seats'
                }
            }
        }).populate({
            path: 'upperSeats',
            populate: {
                path: 'rows',
                populate: {
                    path: 'seats'
                }
            }
        }).exec();
        const bus = await BusModel.findById(travel.busId);

        if(bus.ownerId.toString() != id){
            return res.status(400).json({
                success: false,
                message: "You are not the owner of the bus",
            })
        }

        if (!travel) {
            return res.status(404).json({
                success: false,
                message: "Travel Not Found",
            })
        }

        if (travel.lowerSeats == null) {
            return res.status(200).json({
                success: true,
                message: "No Seats Available",
                travel,
                seats: null,
            });
        }
       
        for(var i=0;i<travel.lowerSeats.rows.length;i++){
            for(var j=0;j<travel.lowerSeats.rows[i].seats.length;j++){
                const {isEmptySpace} = travel.lowerSeats.rows[i].seats[j];
                if(!isEmptySpace){
                    await SeatModel.deleteOne({_id: travel.lowerSeats.rows[i].seats[j].seat});
                    lowerSeats[i][j].seat = null;
                }
                await SeatAvailableModel.deleteOne({_id: travel.lowerSeats.rows[i].seats[j]._id});
            }
            await SeatRowModel.deleteOne({_id: travel.lowerSeats.rows[i]._id});
        }
        await SeatFloorModel.deleteOne({_id: travel.lowerSeats._id});


        if(upperSeats != null){
            for(var i=0;i<travel.upperSeats.rows.length;i++){
                for(var j=0;j<travel.upperSeats.rows[i].seats.length;j++){
                    const {isEmptySpace} = travel.upperSeats.rows[i].seats[j];
                    if(!isEmptySpace){
                        await SeatModel.deleteOne({_id: travel.upperSeats.rows[i].seats[j].seat});
                        upperSeats[i][j].seat = null;
                    }
                    await SeatAvailableModel.deleteOne({_id: travel.upperSeats.rows[i].seats[j]._id});
                }
                await SeatRowModel.deleteOne({_id: travel.upperSeats.rows[i]._id});
            }
            await SeatFloorModel.deleteOne({_id: travel.upperSeats._id});
        }

        travel.lowerSeats = null;
        travel.upperSeats = null;
        await travel.save();

        return res.status(200).json({
            success: true,
            message: "Seats Deleted Successfully",
            seats: travel,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "An Error Occurred While Deleting Seats",
            error: error.message,
        })
    }
}