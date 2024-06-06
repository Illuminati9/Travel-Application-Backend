const mongoose = require("mongoose");
const {Male, Female, Others} = require('../utils/enumTypes');

const profileSchema = new mongoose.Schema({
    gender: {
        type: String,
        default: Male,
        // required: true,
        enum: [Male, Female, Others]
    },
    dateOfBirth: {
        type: String,
        // required: true
    },
    about: {
        type: String,
        // required: true,
    },
    contactNumber: {
        type: String,
        trim: true,
        match: /^\d{10}$/,
        // required: true,
    },
    address: {
        type: String,
        // required: true
    },
})

module.exports = mongoose.model("Profile", profileSchema);