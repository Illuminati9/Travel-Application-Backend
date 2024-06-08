const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema({   
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner",
        required: true,
    },
    buses : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
        }
    ],
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^\S+@\S+\.\S+$/,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{10}$/,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    qualification: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('Staff', staffSchema)