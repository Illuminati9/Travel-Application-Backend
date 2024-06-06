const fs = require('fs')

const User = require('../models/user')
const OTPPhone = require('../models/otpPhone')
const OwnerModel = require('../models/ownerDetails')
const Address = require('../models/address')

const {ownerS3UrlProof,allowedFileTypes} = require('../utils/constants')
const {uploadImageToS3_Type2, getObjectUrl} = require('../config/s3Server')
const {Owner}= require('../utils/enumTypes')
const { default: mongoose } = require('mongoose')

exports.createOwner = async (req, res) => {
    try {
        const { age,
            proofType,
            email,
            street,
            city,
            state,
            country,
            pincode,otp } = req.body;
        const { phoneNumber,id } = req.user;
        const {proofOfId} = req.files;

        console.log(phoneNumber,id);

        if (!age || !proofType || !proofOfId || !email || !street || !city || !state || !country || !pincode || !otp) {
            return res.status(400).json({
                message: "All fields are required",
                success: false
            })
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Please Provide a valid Email Address.",
                success: false
            })
        }

        const ownerDetails1 = await OwnerModel.findOne({ email });
        if (ownerDetails1) {
            return res.status(400).json({
                message: "Owner Already Exists",
                success: false
            })
        }

        const user = await User.findById(id);
        if(!user){
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }

        if(!allowedFileTypes.includes(proofOfId.mimetype)){
            return res.status(400).json({
                message: "Invalid file type",
                success: false
            })
        }

        const filePath = `${ownerS3UrlProof}/${id}`;
        const fileStream = fs.createReadStream(proofOfId.tempFilePath);

        await uploadImageToS3_Type2({
            filePath: filePath,
            contentType: proofOfId.mimetype,
            body: fileStream
        })

        const imageUrl = await getObjectUrl(filePath)

        if(!imageUrl){
            return res.status(404).json({
                success: false,
                message: "Failed to upload proof of id"
            })
        }

        const address = await Address.create({
            street,
            city,
            state,
            country,
            pincode
        });
        if(!address){
            return res.status(400).json({
                message: "Address not created",
                success: false
            })
        }

        const owner = await OwnerModel.create({
            name: `${user.firstName} ${user.lastName}`,
            age,
            phoneNumber,
            proofType,
            proofOfId: imageUrl,
            email,
            address: address._id
        });

        if(!owner){
            return res.status(400).json({
                message: "Owner not created",
                success: false
            })
        }

        user.ownerDetails=owner._id;
        user.accountType=Owner;
        user.email=email;
        await user.save();

        const newOwner = await OwnerModel.findById(owner._id).populate('address').exec();

        return res.status(201).json({
            message: "Owner created successfully",
            success: true,
            newOwner
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message
        })
    }
}



exports.getOwner = async(req,res)=>{
    try {
        const {id} = req.body|| req.params || req.query;
        if(!id){
            return res.status(400).json({
                message: "Owner Id is required",
                success: false
            })
        }

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                message: "Invalid Owner Id",
                success: false
            })
        }

        const owner = await OwnerModel.findById(id);

        if(!owner){
            return res.status(404).json({
                message: "Owner not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Owner fetched successfully",
            success: true,
            owner
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message
        })
    }
}
