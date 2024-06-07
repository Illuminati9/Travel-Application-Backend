const mongoose = require('mongoose')

const { Unavailable, Pending, Cancelled, Booked, Blocked, Available, Occupied, Lower, Upper, Seater, Sleeper, Window, Aisle } = require('../utils/enumTypes')

const seatSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        default: Available,
        enum: [Unavailable, Pending, Cancelled, Booked, Blocked, Available, Occupied],
    },
    seatPlace: {
        type: String,
        required: true,
        enum: [Window, Aisle],
    },
    seatType: {
        type: String,
        required: true,
        enum: [Seater, Sleeper],
    },
    travelDate: {
        type: Date,
        required: true,
    },
    seatRowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeatRow',
        required: true,
    },
    seatFloorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeatFloor',
        required: true,
    },
    seatAvailableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeatAvailable',
        required: true,
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
    },
    travelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Travel',
        required: true,
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Seat', seatSchema)