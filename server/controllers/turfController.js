const Turf = require('../models/Turf');

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRad = (deg) => {
  return deg * (Math.PI / 180);
};

// @desc    Add a new turf
// @route   POST /api/turfs/add
// @access  Public (can be protected later)
exports.addTurf = async (req, res) => {
  try {
    const { name, description, location, latitude, longitude, priceSlots, images, amenities, phoneNumber, email } =
      req.body;

    // Validation
    if (!name || !location || latitude === undefined || longitude === undefined || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, location, latitude, longitude, phoneNumber',
      });
    }

    // Validate lat/lng are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers',
      });
    }

    // Validate lat/lng ranges
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90',
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180',
      });
    }

    // Create turf
    const turf = await Turf.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      location: location.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      priceSlots: priceSlots || { morning: 500, afternoon: 700, evening: 1000 },
      images: images || [],
      amenities: amenities || [],
      phoneNumber: phoneNumber.trim(),
      email: email ? email.toLowerCase() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Turf added successfully',
      data: turf,
    });
  } catch (error) {
    console.error('Add Turf Error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while adding turf',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all turfs
// @route   GET /api/turfs
// @access  Public
exports.getAllTurfs = async (req, res) => {
  try {
    const turfs = await Turf.find({ isActive: true }).select('-__v');

    res.status(200).json({
      success: true,
      count: turfs.length,
      data: turfs,
    });
  } catch (error) {
    console.error('Get All Turfs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching turfs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single turf by ID
// @route   GET /api/turfs/:id
// @access  Public
exports.getTurfById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid turf ID',
      });
    }

    const turf = await Turf.findById(id).select('-__v');

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found',
      });
    }

    res.status(200).json({
      success: true,
      data: turf,
    });
  } catch (error) {
    console.error('Get Turf By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching turf',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get nearby/nearby turfs based on user location
// @route   GET /api/turfs/nearby?latitude=X&longitude=Y&maxDistance=10
// @access  Public
exports.getNearbyTurfs = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance } = req.query;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide latitude and longitude query parameters',
      });
    }

    // Validate numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers',
      });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const distance = maxDistance ? parseFloat(maxDistance) : 10; // Default 10 km

    // Get all active turfs
    const turfs = await Turf.find({ isActive: true }).select('-__v');

    // Calculate distance and filter
    const nearbyTurfs = turfs
      .map((turf) => {
        const dist = calculateDistance(userLat, userLon, turf.latitude, turf.longitude);
        return {
          ...turf.toObject(),
          distance: parseFloat(dist.toFixed(2)), // Distance in km
        };
      })
      .filter((turf) => turf.distance <= distance)
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      count: nearbyTurfs.length,
      userLocation: {
        latitude: userLat,
        longitude: userLon,
      },
      maxDistance: `${distance} km`,
      data: nearbyTurfs,
    });
  } catch (error) {
    console.error('Get Nearby Turfs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching nearby turfs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update turf
// @route   PUT /api/turfs/:id
// @access  Public (can be protected later)
exports.updateTurf = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid turf ID',
      });
    }

    const turf = await Turf.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Turf updated successfully',
      data: turf,
    });
  } catch (error) {
    console.error('Update Turf Error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating turf',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete turf
// @route   DELETE /api/turfs/:id
// @access  Public (can be protected later)
exports.deleteTurf = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid turf ID',
      });
    }

    const turf = await Turf.findByIdAndDelete(id);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Turf deleted successfully',
    });
  } catch (error) {
    console.error('Delete Turf Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting turf',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
