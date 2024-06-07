const mongoose = require('mongoose')
const { Lower, Upper } = require('../utils/enumTypes')

const seatFloorSchema = new mongoose.Schema({
    seatFloor: {
        type: String,
        required: true,
        trim: true,
        enums: [Lower, Upper]
    },
    rows: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SeatRow',
        }
    ],
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('SeatFloor', seatFloorSchema)