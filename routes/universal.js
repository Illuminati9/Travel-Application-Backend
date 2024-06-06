const express = require('express')
const router = express.Router()

const {auth} = require('../middlewares/middleware')
const {getAddressById} = require('../controllers/address')

//! Protected Universal Routes
router.get('/address/:addressId',auth,getAddressById);

module.exports = router;