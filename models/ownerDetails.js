const mongoose = require('mongoose');

const ownerDetailsSchema = new mongoose.Schema({
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
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{10}$/,
    },
    proofType: {
        type: String,
        required: true,
        trim: true,
        default: "Aadhar Card",
        enum: ["Aadhar Card", "Voter ID", "Passport", "Driving License", "PAN Card"],
    },
    proofOfId: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }],
    buses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
    }],
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
        trim: true
    },
});

module.exports = mongoose.model('OwnerDetails', ownerDetailsSchema);