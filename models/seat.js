const mongoose = require('mongoose')

const { Unavailable, Pending, Cancelled, Booked, Blocked, Available, Occupied } = require('../utils/enumTypes')

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
        enum: ['Window', 'Aisle'],
    },
    travelDate:{
        type: Date,
        required: true,
    },
    travelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Travel',
        required: true,
    },
    seatType: {
        type: String,
        required: true,
        enum: ['Seater', 'Sleeper'],
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