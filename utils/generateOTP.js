const otpGenerator = require('otp-generator')
const OTPPhone = require('../models/otpPhone')

exports.generateOTP = async () => {
    let otp;
    do {
        otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
    } while (await OTPPhone.findOne({ otp: otp }));
    return otp;
};