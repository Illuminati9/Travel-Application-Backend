const express = require("express");
const router = express.Router();

const { isAdmin, isUser, auth } = require("../middlewares/middleware");
const {
  getStops,
  createStop,
  updateStop,
  deleteStop,
  getStopById,
  getStopByName,
} = require("../controllers/stop");
const {
  getUser,
  getUsers,
  getUserBasedPhoneNumber,
  getBookingsBasedOnPhoneNumber,
  getBookingsBasedOnUserId,
  getOwners,
  getBooking,
  getOwnerById,
  getBuses,
  getBusById,
  getSourceStops,
  getDestinationStops,
} = require("../controllers/admin");

//! Stop Routes
router.get("/stops", getStops); // Working
router.get("/stop", auth, getStopByName); //Working
router.get("/stop/:id", auth, getStopById); //Working
router.post("/stop", auth, isAdmin, createStop); //Working
router.put("/stop/:id", auth, isAdmin, updateStop); //Working
router.delete("/stop/:id", auth, isAdmin, deleteStop); //Working
router.post("/stops/source", auth, getSourceStops); //Working
router.post("/stops/destination", auth, getDestinationStops); // Working

//! Admin Routes
router.get("/users", auth, isAdmin, getUsers); //Working
router.get("/user/:id", auth, isAdmin, getUser); // Working
router.get("/userPhone", auth, isAdmin, getUserBasedPhoneNumber); //Working
router.get("/owners", auth, isAdmin, getOwners); //Working
router.get("/owner/:id", auth, isAdmin, getOwnerById); // Working

//! Bus Routes
router.get("/buses", auth, isAdmin, getBuses); //Working
router.get("/bus/:id", auth, isAdmin, getBusById); //Working

//! Booking Routes
router.get(
  "/bookings/:phoneNumber",
  auth,
  isAdmin,
  getBookingsBasedOnPhoneNumber
);
router.get("/bookings/:userId", auth, isAdmin, getBookingsBasedOnUserId);
router.get("/booking/:id", auth, isAdmin, getBooking);

module.exports = router;
