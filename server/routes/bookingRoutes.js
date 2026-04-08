const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getTurfBookings,
  cancelBooking,
  getBookingById,
} = require('../controllers/bookingController');

// Protected routes (require JWT token)
router.post('/create', protect, createBooking); // POST /api/bookings/create
router.get('/my', protect, getUserBookings); // GET /api/bookings/my
router.get('/:bookingId', protect, getBookingById); // GET /api/bookings/:bookingId
router.put('/cancel/:bookingId', protect, cancelBooking); // PUT /api/bookings/cancel/:bookingId

// Public routes
router.get('/turf/:turfId', getTurfBookings); // GET /api/bookings/turf/:turfId (for availability check)

module.exports = router;
