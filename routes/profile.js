const express = require('express');
const router = express.Router();

const { deleteAccount, updateDisplayPicture, updateProfile, getUserDetails } = require('../controllers/profile')

const { auth } = require('../middlewares/middleware')

router.post('/deleteAccount', auth, deleteAccount)
router.put('/updateDisplayPicture', auth, updateDisplayPicture)
router.post('/updateProfile', auth, updateProfile)
router.get('/getUserDetails', auth, getUserDetails)

module.exports = router;