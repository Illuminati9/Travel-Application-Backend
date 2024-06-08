const {razorpayInstance} = require('../config/razorpay')

exports.capturePayment = async(req,res)=>{
    try {
        const {ticketDetails, paymentId} = req.body;
        if(!ticketDetails || !paymentId){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const options = {
            amount: ticketDetails.totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString()
        }


        const paymentResponse = await razorpayInstance.orders.create(options);
        if(!paymentResponse){
            return res.status(500).json({
                success: false,
                message: "Payment Failed"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Payment Captured Successfully",
            data: paymentResponse
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.verifyPayment = async(req,res)=>{
    try {
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature,ticketDetails} = req.body;
        if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !ticketDetails){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if(generated_signature !== razorpay_signature){
            return res.status(400).json({
                success: false,
                message: "Invalid Signature"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Payment Verified Successfully"
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

exports.sendPaymentSuccessEmail = async(req,res)=>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
}