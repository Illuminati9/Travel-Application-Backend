const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/,
    },
    phoneNumber: {
        type: String,
        required: true,
        match: /^\d{10}$/,
    },
    source: {
        type: mongoose.Schema.Types.ObjectId || String,
        ref: "Stop",
        required: true
    },
    destination: {
        type: mongoose.Schema.Types.ObjectId || String,
        ref : "Stop",
        required: true
    },
    travellers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Traveller",
        }
    ],
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    destinationTime: {
        type: Date,
        required: true,
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Ticket', ticketSchema)