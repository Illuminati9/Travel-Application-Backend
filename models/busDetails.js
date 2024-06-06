const mongoose = require('mongoose')

const { Petrol, Diesel, Gas } = require('../utils/enumTypes')

const busDetailsSchema = new mongoose.Schema({
    busId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    busType: {
        type: String,
        required: true,
        default: 'Non-AC',
        enum: ['AC', 'Non-AC'],
    },
    capacity: {
        type: Number,
        required: true
    },
    certificates: [
        {
            type: String,
            required: true
        }
    ],
    fuelType: {
        type: String,
        required: true,
        default: Diesel,
        enum: [Petrol, Diesel, Gas],
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    fuelCapacity: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
});

module.exports = mongoose.model('BusDetails', busDetailsSchema);