const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    stopName: {
        type: String,
        required: true
    },
    stopAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    },
    city: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Stop', stopSchema);