const mongoose = require('mongoose')

const UserModel = require('../models/user')
const AddressModel = require('../models/address')

exports.getAddressById = async(req,res)=>{
    try {
        const {addressId} = req.params || req.query;
        if(!addressId){
            return res.status(400).json({
                message: "Address id is required",
                success: false
            })
        }

        if(!mongoose.Types.ObjectId.isValid(addressId)){
            return res.status(400).json({
                message: "Invalid address id",
                success: false
            })
        }

        const address = await AddressModel.findById(addressId)

        if(!address){
            return res.status(404).json({
                message: "Address not found",
                success: false
            })
        }

        return res.status(200).json({
            message: "Address found",
            success: true,
            data: address
        })
    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            success: false,
            error: error.message
        })
    }
}