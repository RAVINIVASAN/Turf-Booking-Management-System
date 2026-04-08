const Booking = require('../models/Booking');
const Turf = require('../models/Turf');
const User = require('../models/User');

// @desc    Create a new booking
// @route   POST /api/bookings/create
// @access  Protected (Login required)
exports.createBooking = async (req, res) => {
  try {
    const { turfId, date, timeSlot, totalPlayers, notes } = req.body;
    const userId = req.user.id; // From JWT middleware

    // Validation
    if (!turfId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: turfId, date, timeSlot',
      });
    }

    // Validate date format (YYYY-MM-DD or accept Date object)
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates',
      });
    }

    // Verify turf exists
    const turf = await Turf.findById(turfId);
    if (!turf) {
      return res.status(404).json({
        success: false,
        message: 'Turf not found',
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // CHECK FOR DOUBLE BOOKING - Most Important
    const existingBooking = await Booking.findOne({
      turfId: turfId,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000), // Same day
      },
      timeSlot: timeSlot,
      bookingStatus: { $ne: 'cancelled' }, // Don't count cancelled bookings
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `Slot ${timeSlot} on ${date} is already booked. Please choose another time slot.`,
        availableSlot: false,
      });
    }

    // Determine price based on time slot
    const slotHour = parseInt(timeSlot.split('AM')[0] || timeSlot.split('PM')[0]);
    let price;

    if (slotHour >= 6 && slotHour < 12) {
      // Morning
      price = turf.priceSlots.morning || 500;
    } else if (slotHour >= 12 && slotHour < 17) {
      // Afternoon
      price = turf.priceSlots.afternoon || 700;
    } else {
      // Evening
      price = turf.priceSlots.evening || 1000;
    }

    // Create booking
    const booking = await Booking.create({
      userId: userId,
      turfId: turfId,
      date: bookingDate,
      timeSlot: timeSlot,
      price: price,
      totalPlayers: totalPlayers || 1,
      notes: notes || '',
    });

    // Populate user and turf details
    await booking.populate([
      { path: 'userId', select: 'name email phoneNumber' },
      { path: 'turfId', select: 'name location priceSlots' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Create Booking Error:', error);

    // Handle unique constraint violation (double booking)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already booked. Please choose another time.',
      });
    }

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
      message: 'Server error while creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings/my
// @access  Protected (Login required)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId: userId })
      .populate('turfId', 'name location priceSlots')
      .populate('userId', 'name email phoneNumber')
      .sort({ date: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all bookings for a specific turf (for availability check)
// @route   GET /api/bookings/turf/:turfId
// @access  Public
exports.getTurfBookings = async (req, res) => {
  try {
    const { turfId } = req.params;
    const { date } = req.query;

    // Validate turf ID
    if (!turfId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid turf ID',
      });
    }

    // Build query
    let query = { turfId: turfId, bookingStatus: { $ne: 'cancelled' } };

    // If date provided, filter by that specific date
    if (date) {
      const bookingDate = new Date(date);
      if (isNaN(bookingDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      query.date = {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phoneNumber')
      .select('-__v')
      .sort({ date: 1, timeSlot: 1 });

    // Get booked slots for this date
    const bookedSlots = bookings.map((b) => b.timeSlot);

    // All available slots
    const allSlots = [
      '6AM-7AM', '7AM-8AM', '8AM-9AM', '9AM-10AM', '10AM-11AM', '11AM-12PM',
      '12PM-1PM', '1PM-2PM', '2PM-3PM', '3PM-4PM', '4PM-5PM', '5PM-6PM',
      '6PM-7PM', '7PM-8PM', '8PM-9PM', '9PM-10PM',
    ];

    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        turfId: turfId,
        date: date || 'All dates',
        totalBookings: bookings.length,
        bookedSlots: bookedSlots,
        availableSlots: availableSlots,
        bookings: bookings,
      },
    });
  } catch (error) {
    console.error('Get Turf Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching turf bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/cancel/:bookingId
// @access  Protected (Login required)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Validate booking ID
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // Check if already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:bookingId
// @access  Protected (Login required)
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Validate booking ID
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phoneNumber')
      .populate('turfId', 'name location priceSlots');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if user owns this booking
    if (booking.userId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get Booking By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
