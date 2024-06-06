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
} = require("../controllers/stop");
const { getTravelBuses, createTravel } = require("../controllers/travel");
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
router.post("/stop", auth, isAdmin, createStop); //Working
router.put("/stop/:id", auth, isAdmin, updateStop); //Working
router.delete("/stop/:id", auth, isAdmin, deleteStop); //Working

module.exports = router;
