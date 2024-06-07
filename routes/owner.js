const express = require('express')
const router = express.Router()

const {createOwner} = require('../controllers/owner')
const {auth,isUser,isStaff,isOwner} = require('../middlewares/middleware')
const { createBus, getBuses, getBus, addStops, getStops, editStops } = require('../controllers/bus')
const {createSeats, getSeats, editSeats, deleteSeats} = require('../controllers/seat')

router.post('/registerOwner',auth,createOwner)  // Working

//! Bus Routes
router.post('/createBus',auth,isOwner,createBus) // Working
router.get('/getBuses',auth,isOwner,getBuses)  // Working
router.get('/getBus/:id',auth,isOwner, getBus) // Working

//! Essential routes for bus
router.post('/createSeats/:busId/travel/:travelId',auth,isOwner,createSeats)
router.get('/getSeats/:travelId',auth,getSeats)
router.put('/editSeats/:travelId',auth,isOwner,editSeats)
router.delete('/deleteSeats/:travelId',auth,isOwner,deleteSeats);

//! Essential stop routes for bus
router.post('/addStops/:busId',auth,isOwner,addStops)
router.get('/getStops/:busId',auth,getStops)
router.put('/editStops/:busId',auth,isOwner,editStops);

module.exports = router