const mongoose = require('mongoose');

// Booking Schema
const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    turfId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turf',
      required: [true, 'Please provide turf ID'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide booking date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please provide time slot'],
      enum: {
        values: ['6AM-7AM', '7AM-8AM', '8AM-9AM', '9AM-10AM', '10AM-11AM', '11AM-12PM',
                 '12PM-1PM', '1PM-2PM', '2PM-3PM', '3PM-4PM', '4PM-5PM', '5PM-6PM',
                 '6PM-7PM', '7PM-8PM', '8PM-9PM', '9PM-10PM'],
        message: 'Invalid time slot',
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide booking price'],
      min: [0, 'Price cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    totalPlayers: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 player required'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to prevent double booking (unique constraint)
bookingSchema.index({ turfId: 1, date: 1, timeSlot: 1 }, { unique: true });
bookingSchema.index({ userId: 1 });
bookingSchema.index({ turfId: 1 });

// Populate user and turf details before returning
bookingSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'userId',
    select: 'name email phoneNumber',
  }).populate({
    path: 'turfId',
    select: 'name location priceSlots',
  });
  next();
});

// Create and export model
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
