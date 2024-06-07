const mongoose = require('mongoose')

const seatRowSchema = new mongoose.Schema({
    seats: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SeatAvailable',
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

module.exports = mongoose.model('SeatRow', seatRowSchema)