const mongoose = require('mongoose')

const travelSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
        required: true
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop',
        required: true
    },
    departure: {
        type: Date,
        required: true
    },
    seatCapacity:{
        type: Number,
        required: true,
        trim: true,
    },
    seats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seat'
        }
    ],
    arrival: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true,
    },
    distance: {
        type: Number,
        required: true
    },
},{
    timestamps: true
});

module.exports = mongoose.model('Travel', travelSchema);