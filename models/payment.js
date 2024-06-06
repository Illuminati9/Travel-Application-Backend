const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentDetails: {
        type: String,
        required: true
    },
    paymentMode: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Payment', paymentSchema);