const mongoose = require('mongoose');

// Turf Schema
const turfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide turf name'],
      trim: true,
      maxlength: [100, 'Turf name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Please provide turf location'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Please provide latitude'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Please provide longitude'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    priceSlots: {
      morning: {
        type: Number,
        default: 500,
        min: [0, 'Price cannot be negative'],
      },
      afternoon: {
        type: Number,
        default: 700,
        min: [0, 'Price cannot be negative'],
      },
      evening: {
        type: Number,
        default: 1000,
        min: [0, 'Price cannot be negative'],
      },
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
    },
    email: {
      type: String,
      lowercase: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Geospatial index for location-based queries
turfSchema.index({ latitude: 1, longitude: 1 });

// Create and export model
const Turf = mongoose.model('Turf', turfSchema);

module.exports = Turf;
