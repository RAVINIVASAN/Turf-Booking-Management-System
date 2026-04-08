const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const turfRoutes = require('./routes/turfRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Test Route
app.get('/', (req, res) => {
  res.json({
    message: '✔ Turf Booking Management System - Backend Server',
    status: 'Server is running successfully',
    version: '1.0.0',
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is healthy',
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Turf Routes
app.use('/api/turfs', turfRoutes);

// Booking Routes
app.use('/api/bookings', bookingRoutes);

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 'error',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✔ Server is running on http://localhost:${PORT}`);
  console.log(`✔ Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
