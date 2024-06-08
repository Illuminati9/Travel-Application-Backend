const mongoose = require('mongoose');

const travellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    age: {
        type: Number,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
    },
    seatId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
    },
    phoneNumber: {
        type: String,
        trim: true,
        match: /^\d{10}$/,
    },
})

module.exports = mongoose.model('Traveller', travellerSchema)
