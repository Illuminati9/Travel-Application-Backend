const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    ticketId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
    }
},{
    timestamps: true,
})

module.exports = mongoose.model('Booking', bookingSchema)