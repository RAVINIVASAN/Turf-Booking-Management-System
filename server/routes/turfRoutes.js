const express = require('express');
const router = express.Router();
const {
  addTurf,
  getAllTurfs,
  getTurfById,
  getNearbyTurfs,
  getNearbyTurfsWithAvailability,
  updateTurf,
  deleteTurf,
} = require('../controllers/turfController');
const { protect, authorize } = require('../config/auth');

// Public routes - anyone can view
router.get('/', getAllTurfs); // GET /api/turfs/
router.get('/nearby', getNearbyTurfs); // GET /api/turfs/nearby?latitude=X&longitude=Y&maxDistance=10
router.get('/nearby-with-availability', getNearbyTurfsWithAvailability); // GET /api/turfs/nearby-with-availability?latitude=X&longitude=Y&date=YYYY-MM-DD&maxDistance=10
router.get('/:id', getTurfById); // GET /api/turfs/:id

// Protected routes - only admin/vendor can create/update/delete
router.post('/add', addTurf); // POST /api/turfs/add (temporarily unprotected for testing)
router.put('/:id', protect, authorize('admin', 'vendor'), updateTurf); // PUT /api/turfs/:id
router.delete('/:id', protect, authorize('admin', 'vendor'), deleteTurf); // DELETE /api/turfs/:id

module.exports = router;
