const Razorpay = require('razorpay')
require('dotenv').config()

const {RAZORPAY_KEY_ID,RAZORPAY_KEY_SECRET} = process.env;

if(!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET){
    console.error('Razorpay keys are missing')
    process.exit(1)
}

const instance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
})

exports.razorpayInstance = instance