const Profile = require("../models/profile");
const User = require("../models/user");
const { getObjectUrl, uploadImageToS3_Type2 } = require("../config/s3Server");
const { profileS3Url, svgType, jpegType, pngType, jpgType, svgType2, allowedFileTypes } = require("../utils/constants");

const fs = require('fs');
const mongoose = require('mongoose')

exports.updateProfile = async (req, res) => {
    try {
        const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "User ID is required to update the profile fields",
            });
        }

        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            profileDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const userDetails = await User.findById(userId, { password: 0 })
            .populate("additionalDetails")
            .exec();

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("Printing ID: ", req.user.id);

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

        await User.findByIdAndDelete({ _id: userId });
        res.status(200).json({
            success: true,
            message: "User Deleted Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user account",
            error: error.message,
        });
    }
};

exports.updateDisplayPicture = async (req, res) => {
    try {
        console.log(req.files.file);
        console.log(req.body);
        const displayPicture = req.files.file;
        const userId = req.user.id;
        console.log(req.user);

        if (!displayPicture) {
            return res.status(400).json({
                success: false,
                message: "Display picture is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "User ID is required to update the display picture",
            });
        }

        if (!allowedFileTypes.includes(displayPicture.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "File Type is not matching and only allows image/svg or image/jpeg or image/png or image/jpg",
            });
        }


        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Not Found",
            });
        }

        const filePath = `${profileS3Url}/${userId}`;
        const fileStream = fs.createReadStream(displayPicture.tempFilePath);

        await uploadImageToS3_Type2({
            filePath: filePath,
            contentType: displayPicture.mimetype,
            body: fileStream,
        });

        const imageUrl = await getObjectUrl(filePath)
        console.log(imageUrl)


        if (!imageUrl) {
            return res.status(500).json({
                success: false,
                message: "Failed to update profile picture",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { image: imageUrl },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile picture",
            error: error.message,
        });
    }
};