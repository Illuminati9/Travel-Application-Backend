const twilio = require('twilio');

const sendSMSPhone = async (phoneNumber, body) => {
  const client = new twilio(process.env.TWILIO_AUTH_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body: body,
      from: process.env.PHONE_NUMBER,
      to: `+91${phoneNumber}`,
    });
    console.log('Message sent Successfully: ', message);
    return { success: true };
  } catch (error) {
    console.log('Error Occured While Sending SMS: ', error);
    return {
      success: false,
      errorCode: 'SMS_SEND_ERROR',
      errorMessage: 'SMS sending failed',
    };
  }
};


module.exports = sendSMSPhone;