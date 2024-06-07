const mongoose = require('mongoose')

const seatAvailableSchema = new mongoose.Schema({
    isEmptySpace: {
        type: Boolean,
        required: true,
        default: false,
    },
    seat : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
    },
})

module.exports = mongoose.model('SeatAvailable', seatAvailableSchema)