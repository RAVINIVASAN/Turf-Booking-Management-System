const User = require('../models/User');
const Booking = require('../models/Booking');
const Turf = require('../models/Turf');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    // Build filter
    let filter = {};
    if (role) {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    // Validate role
    if (!['user', 'admin', 'vendor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or vendor.',
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account',
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all bookings (admin view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10, startDate, endDate } = req.query;

    // Build filter
    let filter = {};

    if (status) {
      filter.bookingStatus = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Booking.countDocuments(filter);

    // Get bookings with populated user and turf data
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phoneNumber')
      .populate('turfId', 'name location priceSlots')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Count users by role
    const users = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const vendors = await User.countDocuments({ role: 'vendor' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Count turfs
    const turfs = await Turf.countDocuments();
    const activeTurfs = await Turf.countDocuments({ isActive: true });

    // Count bookings
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({
      bookingStatus: 'confirmed',
    });
    const completedBookings = await Booking.countDocuments({
      bookingStatus: 'completed',
    });
    const cancelledBookings = await Booking.countDocuments({
      bookingStatus: 'cancelled',
    });

    // Calculate revenue
    const paidBookings = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
    ]);

    const totalRevenue = paidBookings[0]?.totalRevenue || 0;

    // Average price per booking
    const avgPrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: users,
          admins,
          vendors,
          regularUsers,
        },
        turfs: {
          total: turfs,
          active: activeTurfs,
          inactive: turfs - activeTurfs,
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          pending: totalBookings - confirmedBookings - completedBookings - cancelledBookings,
        },
        revenue: {
          total: totalRevenue,
          average: avgPrice,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get all turfs (admin view)
// @route   GET /api/admin/turfs
// @access  Private/Admin
exports.getAllTurfs = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    // Build filter
    let filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Turf.countDocuments(filter);

    // Get turfs
    const turfs = await Turf.find(filter)
      .populate('createdBy', 'name email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: turfs.length,
      total,
      pages: Math.ceil(total / limit),
      data: turfs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching turfs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Update booking status (mark as completed, etc.)
// @route   PUT /api/admin/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const { id } = req.params;

    // Validate statuses
    const validBookingStatuses = ['confirmed', 'cancelled', 'completed'];
    const validPaymentStatuses = ['pending', 'paid', 'cancelled', 'refunded'];

    if (bookingStatus && !validBookingStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid booking status. Must be one of: ${validBookingStatuses.join(', ')}`,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    // Update booking
    const updateData = {};
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('userId', 'name email')
      .populate('turfId', 'name location');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
