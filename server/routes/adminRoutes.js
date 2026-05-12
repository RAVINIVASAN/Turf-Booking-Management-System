const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../config/auth');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getDashboardStats,
  getAllTurfs,
  updateBookingStatus,
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Bookings management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

// Turfs management
router.get('/turfs', getAllTurfs);

module.exports = router;
