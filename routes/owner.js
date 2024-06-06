const express = require('express')
const router = express.Router()

const {createOwner} = require('../controllers/owner')
const {auth,isUser,isStaff,isOwner} = require('../middlewares/middleware')
const { createBus, getBuses, getBus, addStops, getStops, editStops } = require('../controllers/bus')
const {createSeats, getSeats, editSeats} = require('../controllers/seat')

router.post('/registerOwner',auth,createOwner)  // Working

//! Bus Routes
router.post('/createBus',auth,isOwner,createBus) // Working
router.get('/getBuses',auth,isOwner,getBuses)  // Working
router.get('/getBus/:id',auth,isOwner, getBus) // Working

//! Essential routes for bus
router.post('/createSeats/:busId',auth,isOwner,createSeats)
router.get('/getSeats/:busId',auth,getSeats)
router.put('/editSeats/:busId',auth,isOwner,editSeats)

//! Essential stop routes for bus
router.post('/addStops/:busId',auth,isOwner,addStops)
router.get('/getStops/:busId',auth,getStops)
router.put('/editStops/:busId',auth,isOwner,editStops);

module.exports = router