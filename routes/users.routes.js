const express = require("express");
const router = express.Router();

const {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  getStopById,
  getStopByName,
  getStopByCity
} = require("../controllers/stop.controller");
const { getTravelBuses, createTravel } = require("../controllers/travel.controller");
const {
  auth,
  isUser,
  isStaff,
  isOwner,
  isAdmin,
} = require("../middlewares/middleware");

//! Travel Routes
router.post("/searchTravel", getTravelBuses); //Working
router.post("/createTravel", auth, isOwner, createTravel); //Working

//! Stop Routes
router.get("/stops", auth, getStops); // Working
router.get("/stop", auth, getStopByName); //Working
router.get('/stopByCity',auth,getStopByCity)
router.get("/stop/:id", auth, getStopById); //Working



module.exports = router;
