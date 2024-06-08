const mongoose = require('mongoose')
const twilio = require('twilio')

const otpPhoneSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{10}$/,
    },
    otp: {
        type: String,
        required: true,
        match: /^\d{6}$/,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    },
})

async function sendSMS(phoneNumber, otp){

    const client = new twilio(process.env.TWILIO_AUTH_SID, process.env.TWILIO_AUTH_TOKEN)
  
    try {
      const message = await client.messages.create({
        body: `Your Verification Code is ${otp}`,
        from: process.env.PHONE_NUMBER,
        to: `+91${phoneNumber}`
      })
      console.log("Message sent Successfully: ", message);
      return { success: true };
    } catch (error) {
      console.log("Error Occured While Sending SMS: ", error);
      return {
        success: false,
        errorCode: "SMS_SEND_ERROR",
        errorMessage: "SMS sending failed",
      };
    }
  }

otpPhoneSchema.pre('save', async function (next) {
    const phoneNumber = this.phoneNumber;
    const otp = this.otp;
    
    const result = await sendSMS(phoneNumber, otp);
    console.log(result);

    if(!result.success){
        console.log("Error during OTP SMS sending",result.errorMessage);
    }

    next()
});


module.exports = mongoose.model('OTPPhone', otpPhoneSchema)