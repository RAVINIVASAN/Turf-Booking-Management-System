const express = require('express');
const router = express.Router();
const {
  addTurf,
  getAllTurfs,
  getTurfById,
  getNearbyTurfs,
  updateTurf,
  deleteTurf,
} = require('../controllers/turfController');

// Turf routes
router.post('/add', addTurf); // POST /api/turfs/add
router.get('/', getAllTurfs); // GET /api/turfs/
router.get('/nearby', getNearbyTurfs); // GET /api/turfs/nearby?latitude=X&longitude=Y&maxDistance=10
router.get('/:id', getTurfById); // GET /api/turfs/:id
router.put('/:id', updateTurf); // PUT /api/turfs/:id
router.delete('/:id', deleteTurf); // DELETE /api/turfs/:id

module.exports = router;
