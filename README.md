# Turf Booking Management System

A comprehensive booking management system for turf facilities built with Node.js, Express, and MongoDB. This project implements a complete backend API for managing turf facilities, user authentication, bookings, and dynamic pricing.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [API Endpoints](#api-endpoints)
- [Feature Documentation](#feature-documentation)
- [Testing Guide](#testing-guide)
- [Error Handling](#error-handling)
- [Status Codes](#status-codes)
- [Features Summary](#features-summary)
- [Next Steps](#next-steps)

---

## Project Overview

This system provides a complete backend for booking sports turfs with the following capabilities:
- User registration and authentication with JWT
- Turf management with location-based search
- Advanced booking system with double-booking prevention
- Dynamic pricing based on time slots and demand
- Complete API documentation and testing guides

**Status:** Days 1-5 Complete ✅

---

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (for database)
- Git
- Postman or Thunder Client (for API testing)

---

## Project Structure

```
smart-turf-booking/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Turf.js               # Turf schema
│   │   └── Booking.js            # Booking schema
│   ├── controllers/
│   │   ├── authController.js     # Authentication handlers
│   │   ├── turfController.js     # Turf management handlers
│   │   └── bookingController.js  # Booking handlers
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── turfRoutes.js         # Turf endpoints
│   │   └── bookingRoutes.js      # Booking endpoints
│   ├── utils/
│   │   └── pricing.js            # Dynamic pricing utility
│   ├── server.js                 # Main server file
│   ├── package.json              # Dependencies
│   └── .env                       # Environment variables (not in git)
├── client/                        # Frontend (placeholder)
└── README.md                      # This file
```

---

## Installation & Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/RAVINIVASAN/Turf-Booking-Management-System.git
cd smart-turf-booking
```

### Step 2: Install Dependencies

```bash
cd server
npm install
```

**Dependencies installed:**
- express - Web framework
- mongoose - MongoDB ODM
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- nodemon (dev) - Auto-reload on changes

### Step 3: Configure Environment Variables

Create a `.env` file in the `server` folder:

```bash
touch server/.env
```

(See [Environment Variables](#environment-variables) section below)

### Step 4: Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Expected output:
```
✔ Server is running on http://localhost:5000
✔ MongoDB Connected: Turf database
```

---

## Environment Variables

Create **server/.env** with the following:

```env
# MongoDB Atlas Connection String
# Database: Turf (created in MongoDB Atlas)
# Replace: username, password, cluster name
MONGO_URI=mongodb://ravit_user_db:ravi@ac-awwhlle-shard-00-00.yqwjblv.mongodb.net:27017,ac-awwhlle-shard-00-01.yqwjblv.mongodb.net:27017,ac-awwhlle-shard-00-02.yqwjblv.mongodb.net:27017/Turf?ssl=true&replicaSet=atlas-hate7c-shard-0&authSource=admin&appName=RoomBookingSystem

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret Key (for signing tokens)
# Change in production!
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
```

---

## MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create an account with email and password
4. Verify your email

### Step 2: Create a Cluster

1. After login, click "Create" to build a new database
2. Select **Free** tier (M0)
3. Choose AWS as cloud provider
4. Select a region close to you
5. Click "Create Cluster" (takes 5-10 minutes)

### Step 3: Create Database User

1. In left sidebar, go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Set username: `ravit_user_db`
5. Set password: `ravi` (or your chosen password)
6. Click **Add User**

### Step 4: Allow Network Access

1. In left sidebar, go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Click **Confirm**

### Step 5: Get Connection String

1. Go to **Deployment** → **Databases**
2. Click "Connect" on your cluster
3. Select "Drivers" (Node.js)
4. Copy the connection string
5. Replace `<password>` with your password

### Step 6: Create Database

The database "Turf" will be created automatically when you first insert data. No manual creation needed in MongoDB Atlas.

---

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Health Check
- **GET** `/` - Welcome message
- **GET** `/api/health` - Check server health

---

## 🔐 Authentication APIs (Day 2)

All authentication endpoints are **PUBLIC** (no token required).

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User (Protected)

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 🏟️ Turf Management APIs (Day 3)

All turf endpoints are **PUBLIC** (no token required for viewing).

### 1. Add Turf

**Endpoint:** `POST /api/turfs/add`

**Request:**
```json
{
  "name": "Green Park Turf",
  "description": "World class cricket ground",
  "location": "Bangalore, Karnataka",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "priceSlots": {
    "morning": 500,
    "afternoon": 700,
    "evening": 1000
  },
  "images": ["url1", "url2"],
  "amenities": ["Lights", "Parking", "Washroom"],
  "phoneNumber": "+91-9876543210",
  "email": "turf@example.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Turf added successfully",
  "data": {
    "_id": "turf_id_here",
    "name": "Green Park Turf",
    "location": "Bangalore, Karnataka",
    "latitude": 12.9352,
    "longitude": 77.6245,
    ...
  }
}
```

---

### 2. Get All Turfs

**Endpoint:** `GET /api/turfs/`

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "turf_1",
      "name": "Green Park Turf",
      "location": "Bangalore",
      ...
    }
  ]
}
```

---

### 3. Get Single Turf

**Endpoint:** `GET /api/turfs/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "turf_id",
    "name": "Green Park Turf",
    ...
  }
}
```

---

### 4. Get Nearby Turfs (Location-Based)

**Endpoint:** `GET /api/turfs/nearby?latitude=X&longitude=Y&maxDistance=10`

**Query Parameters:**
- `latitude` (required) - User's latitude
- `longitude` (required) - User's longitude
- `maxDistance` (optional) - Search radius in km (default: 10)

**Example:**
```
GET /api/turfs/nearby?latitude=12.9352&longitude=77.6245&maxDistance=15
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "userLocation": {
    "latitude": 12.9352,
    "longitude": 77.6245
  },
  "maxDistance": "15 km",
  "data": [
    {
      "_id": "turf_1",
      "name": "Green Park Turf",
      "location": "Bangalore",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "distance": 0.5
    }
  ]
}
```

**Algorithm:** Uses Haversine formula for accurate distance calculation

---

### 5. Update Turf

**Endpoint:** `PUT /api/turfs/:id`

**Request:**
```json
{
  "name": "Updated Name",
  "rating": 4.8
}
```

---

### 6. Delete Turf

**Endpoint:** `DELETE /api/turfs/:id`

---

## 📅 Booking APIs (Day 4) ⭐ PROTECTED

**All booking endpoints require JWT token in Authorization header.**

### Authentication Header Format
```
Authorization: Bearer <your_jwt_token>
```

### 1. Create Booking

**Endpoint:** `POST /api/bookings/create`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request:**
```json
{
  "turfId": "turf_id_here",
  "date": "2025-04-15",
  "timeSlot": "5PM-6PM",
  "totalPlayers": 11,
  "notes": "Final match"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "pricingInfo": {
    "basePrice": 1000,
    "priceAfterPeakMultiplier": 1500,
    "peakMultiplier": "150%",
    "isPeakTime": true,
    "demandAdjustment": 0,
    "demandApplied": false,
    "finalPrice": 1500,
    "priceCategory": "Evening"
  },
  "data": {
    "_id": "booking_id",
    "userId": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "turfId": {
      "_id": "turf_id",
      "name": "Cricket Ground",
      "location": "Bangalore"
    },
    "date": "2025-04-15T00:00:00.000Z",
    "timeSlot": "5PM-6PM",
    "price": 1500,
    "paymentStatus": "pending",
    "bookingStatus": "confirmed",
    "totalPlayers": 11,
    "createdAt": "2025-04-08T10:30:00.000Z"
  }
}
```

**Error - Double Booking (400):**
```json
{
  "success": false,
  "message": "Slot 5PM-6PM on 2025-04-15 is already booked. Please choose another time slot."
}
```

---

### 2. Get User's Bookings

**Endpoint:** `GET /api/bookings/my`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "booking_1",
      "userId": { ... },
      "turfId": { ... },
      "date": "2025-04-15T00:00:00.000Z",
      "timeSlot": "5PM-6PM",
      "price": 1500,
      "paymentStatus": "pending",
      "bookingStatus": "confirmed"
    }
  ]
}
```

---

### 3. Get Single Booking

**Endpoint:** `GET /api/bookings/:bookingId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 4. Cancel Booking

**Endpoint:** `PUT /api/bookings/cancel/:bookingId`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "booking_id",
    "bookingStatus": "cancelled",
    "paymentStatus": "refunded",
    ...
  }
}
```

---

### 5. Get Turf Availability

**Endpoint:** `GET /api/bookings/turf/:turfId?date=2025-04-15`

**Query Parameters:**
- `date` (required) - Format: YYYY-MM-DD

**Response (200):**
```json
{
  "success": true,
  "data": {
    "turfId": "turf_id",
    "date": "2025-04-15",
    "totalBookings": 2,
    "bookedSlots": ["5PM-6PM", "6PM-7PM"],
    "availableSlots": [
      "6AM-7AM", "7AM-8AM", "8AM-9AM", "9AM-10AM", "10AM-11AM", "11AM-12PM",
      "12PM-1PM", "1PM-2PM", "2PM-3PM", "3PM-4PM", "4PM-5PM", "7PM-8PM",
      "8PM-9PM", "9PM-10PM"
    ],
    "bookings": [...]
  }
}
```

---

## 💰 Dynamic Pricing System (Day 5)

The booking system automatically calculates prices based on:

### Time Slot Categories

| Category | Time Range | Base Price | Peak Multiplier | Example |
|----------|-----------|-----------|-----------------|---------|
| **Morning** | 6AM-10AM | ₹500 | 1.0x (100%) | 8AM-9AM = ₹500 |
| **Afternoon** | 10AM-4PM | ₹700 | 1.1x (110%) | 2PM-3PM = ₹770 |
| **Evening** | 4PM-10PM | ₹1000 | 1.5x (150%) | 7PM-8PM = ₹1500 |

### Pricing Calculation Formula

```
FINAL PRICE = [BASE_PRICE × PEAK_MULTIPLIER] + DEMAND_ADJUSTMENT

Where:
- BASE_PRICE = Price from turf's priceSlots
- PEAK_MULTIPLIER = 1.0 (morning), 1.1 (afternoon), 1.5 (evening)
- DEMAND_ADJUSTMENT = 0 if bookings ≤ threshold
                    = (bookings - threshold) × ₹100 if bookings > threshold
```

### Demand-Based Surge Pricing

- **Threshold:** 3 bookings on same turf + date
- **Surge Amount:** ₹100 per excess booking
- **Example:** 4th booking = ₹100 surge; 5th booking = ₹200 surge

### Pricing Examples

**Example 1: Morning Booking (Low Price)**
```
Turf: Green Park (default pricing)
Time Slot: 8AM-9AM
Bookings on date: 1

Base Price: ₹500
Peak Multiplier: 1.0x = ₹500
Demand Adjustment: ₹0 (only 1 booking)
FINAL PRICE: ₹500
```

**Example 2: Evening Peak Hour (Higher Price)**
```
Turf: Green Park
Time Slot: 7PM-8PM
Bookings on date: 2

Base Price: ₹1000
Peak Multiplier: 1.5x = ₹1500
Demand Adjustment: ₹0 (only 2 bookings)
FINAL PRICE: ₹1500 (+200% compared to morning)
```

**Example 3: High Demand Evening (Peak + Surge)**
```
Turf: Cricket Ground
Time Slot: 8PM-9PM
Bookings on date: 5

Base Price: ₹1000
Peak Multiplier: 1.5x = ₹1500
Demand Adjustment: (5-3) × ₹100 = ₹200
FINAL PRICE: ₹1700 (peak + demand surge)
```

### Available Time Slots (16 slots)

**Morning (4 slots):**
- 6AM-7AM, 7AM-8AM, 8AM-9AM, 9AM-10AM

**Afternoon (8 slots):**
- 10AM-11AM, 11AM-12PM, 12PM-1PM, 1PM-2PM, 2PM-3PM, 3PM-4PM, 4PM-5PM, 5PM-6PM

**Evening (4 slots):**
- 6PM-7PM, 7PM-8PM, 8PM-9PM, 9PM-10PM

---

## 🧪 Testing Guide

### Prerequisites
- Server running on `http://localhost:5000`
- MongoDB connected to "Turf" database
- Postman or Thunder Client installed

### Complete Testing Flow

#### Step 1: Register a User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "Password@123"
}
```

#### Step 2: Login to Get Token
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ravi@example.com",
  "password": "Password@123"
}
```
**Save the token from response!**

#### Step 3: Add a Turf
```
POST http://localhost:5000/api/turfs/add
Content-Type: application/json

{
  "name": "Cricket Ground - Mumbai",
  "location": "Bandra, Mumbai",
  "latitude": 19.0557,
  "longitude": 72.8295,
  "priceSlots": {
    "morning": 500,
    "afternoon": 700,
    "evening": 1000
  },
  "phoneNumber": "9876543210",
  "email": "cricket@ground.com"
}
```
**Save the turf ID from response!**

#### Step 4: Create a Booking (Protected)
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "PASTE_TURF_ID_HERE",
  "date": "2025-04-15",
  "timeSlot": "5PM-6PM",
  "totalPlayers": 11
}
```

#### Step 5: Try Double Booking (Should Fail)
```
Same request as Step 4 (same date, same timeSlot)
```
**Expected:** Error message about slot already booked

#### Step 6: Get Available Slots
```
GET http://localhost:5000/api/bookings/turf/PASTE_TURF_ID_HERE?date=2025-04-15
Content-Type: application/json
```

#### Step 7: Get Your Bookings (Protected)
```
GET http://localhost:5000/api/bookings/my
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

#### Step 8: Cancel a Booking (Protected)
```
PUT http://localhost:5000/api/bookings/cancel/BOOKING_ID_HERE
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Add Turf:**
```bash
curl -X POST http://localhost:5000/api/turfs/add \
  -H "Content-Type: application/json" \
  -d '{"name":"Turf Name","location":"Location","latitude":12.9352,"longitude":77.6245,"phoneNumber":"9876543210"}'
```

**Create Booking (with token):**
```bash
curl -X POST http://localhost:5000/api/bookings/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"turfId":"TURF_ID","date":"2025-04-15","timeSlot":"5PM-6PM"}'
```

---

## Error Handling

### Common Error Scenarios

**Missing Required Fields (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: turfId, date, timeSlot"
}
```

**Double Booking Attempt (400):**
```json
{
  "success": false,
  "message": "Slot 5PM-6PM on 2025-04-15 is already booked. Please choose another time slot."
}
```

**Invalid Token (401):**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Missing Authorization (401):**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Resource Not Found (404):**
```json
{
  "success": false,
  "message": "Turf not found"
}
```

**Duplicate Email (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK | Successful GET, PUT request |
| **201** | Created | User registered, Booking created |
| **400** | Bad Request | Missing fields, Double booking, Invalid data |
| **401** | Unauthorized | Missing/invalid token, wrong password |
| **403** | Forbidden | Not owner of resource |
| **404** | Not Found | Turf/Booking doesn't exist |
| **500** | Server Error | Database connection error |

---

## Features Summary

### ✅ Completed Features

#### Day 1: Project Setup
- [x] Node.js + Express server
- [x] MongoDB Atlas connection
- [x] Project folder structure
- [x] GitHub repository

#### Day 2: Authentication
- [x] User registration with email validation
- [x] Secure password hashing with bcryptjs
- [x] Login with JWT token generation
- [x] Protected routes with auth middleware
- [x] 30-day token expiration

#### Day 3: Turf Management
- [x] Turf CRUD operations
- [x] Location fields (latitude, longitude)
- [x] Haversine distance calculation
- [x] Location-based filtering
- [x] Nearby turfs search with max distance

#### Day 4: Booking System
- [x] Booking model with all required fields
- [x] JWT-protected booking routes
- [x] Double-booking prevention (unique constraint + controller logic)
- [x] Automatic price calculation
- [x] Available slots display
- [x] Booking cancellation
- [x] User-specific bookings

#### Day 5: Dynamic Pricing
- [x] Time-based pricing (morning, afternoon, evening)
- [x] Peak hour surcharge (50% for evening)
- [x] Demand-based surge pricing
- [x] Complete pricing breakdown in responses
- [x] Database storage of pricing details
- [x] Customizable pricing thresholds

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "user"),
  createdAt: Date
}
```

### Turf Model
```javascript
{
  name: String,
  description: String,
  location: String,
  latitude: Number,
  longitude: Number,
  priceSlots: {
    morning: Number,
    afternoon: Number,
    evening: Number
  },
  images: [String],
  amenities: [String],
  phoneNumber: String,
  email: String,
  rating: Number (0-5),
  isActive: Boolean,
  createdAt: Date
}
```

### Booking Model
```javascript
{
  userId: ObjectId (ref: User),
  turfId: ObjectId (ref: Turf),
  date: Date,
  timeSlot: String,
  price: Number,
  priceBreakdown: {
    basePrice: Number,
    peakMultiplier: Number,
    priceAfterPeakMultiplier: Number,
    isPeakTime: Boolean,
    demandAdjustment: Number,
    demandApplied: Boolean,
    percentageIncrease: Number
  },
  priceCategory: String,    // 'morning', 'afternoon', 'evening'
  categoryLabel: String,    // 'Morning', 'Afternoon', 'Evening'
  paymentStatus: String     // 'pending', 'paid', 'refunded'
  bookingStatus: String,    // 'confirmed', 'cancelled'
  totalPlayers: Number,
  notes: String,
  createdAt: Date
}
```

---

## Key Implementation Details

### Double-Booking Prevention
1. **Database Level:** Unique constraint on (turfId, date, timeSlot)
2. **Application Level:** Check existing booking before creation
3. **Soft Delete:** Cancelled bookings don't block new bookings

### JWT Authentication Flow
1. User logs in → gets token
2. Token sent in `Authorization: Bearer <token>` header
3. `auth.js` middleware verifies token
4. User ID attached to request object
5. Controller uses `req.user.id`

### Price Calculation by Time Slot
- **Morning (6AM-10AM):** priceSlots.morning
- **Afternoon (10AM-4PM):** priceSlots.afternoon
- **Evening (4PM-10PM):** priceSlots.evening

### Location-Based Search
Uses Haversine formula to calculate great-circle distance between two points on Earth:
```
Distance = R × arccos(sin(lat1) × sin(lat2) + cos(lat1) × cos(lat2) × cos(|lon2 - lon1|))
Where R = 6371 km (Earth's radius)
```

---

## Security Features

✅ Passwords hashed with bcryptjs (never stored in plain text)
✅ JWT tokens with expiration (30 days)
✅ Email uniqueness validation
✅ Protected routes with middleware
✅ MongoDB injection prevention via Mongoose
✅ Proper error messages (no sensitive data leakage)
✅ CORS configured
✅ Input validation on all endpoints

---

## Development Best Practices

### Code Structure
- **MVC Pattern:** Models, Controllers, Routes separation
- **Middleware:** Centralized auth and error handling
- **Utilities:** Reusable pricing functions
- **Error Handling:** Comprehensive try-catch blocks

### Testing
- Use Postman/Thunder Client for API testing
- Test all success and error paths
- Verify authentication on protected routes
- Test double-booking prevention
- Verify pricing calculations

### Git Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "feat(feature-name): Description"

# Push to GitHub
git push origin main
```

---

## Next Steps (Future Enhancements)

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Email notifications for bookings
- [ ] Review and rating system
- [ ] User profile management
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Seasonal pricing
- [ ] Loyalty discounts for repeat customers
- [ ] Advance booking discounts (book 2 weeks ahead = 10% off)
- [ ] Frontend React application
- [ ] Mobile app (React Native)

---

## Troubleshooting

### MongoDB Connection Issues

**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
1. Check MONGO_URI in .env is correct
2. Verify MongoDB Atlas cluster is active
3. Check IP whitelist in MongoDB Atlas
4. Test connection: `ping cluster.mongodb.net`

### Token Issues

**Problem:** `Invalid token` or `Not authorized`

**Solution:**
1. Ensure token is copied correctly from login response
2. Check Authorization header format: `Bearer <token>`
3. Verify JWT_SECRET matches in .env
4. Check if token has expired (30 days)

### Booking Errors

**Problem:** `Slot already booked`

**Solution:**
1. Check available slots using GET `/api/bookings/turf/:turfId?date=YYYY-MM-DD`
2. Try a different time slot
3. Try a different date

**Problem:** `Cannot book for past dates`

**Solution:**
1. Ensure booking date is in the future
2. Use format: YYYY-MM-DD or ISO date string

---

## API Health Check

Verify your setup is working:

```bash
# Check server
curl http://localhost:5000/

# Check health
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Support & Documentation

- **GitHub Issues:** https://github.com/RAVINIVASAN/Turf-Booking-Management-System/issues
- **MongoDB Documentation:** https://docs.mongodb.com
- **Express Documentation:** https://expressjs.com
- **JWT Reference:** https://jwt.io

---

## License

ISC

---

## Author

Built as part of a comprehensive backend development project learning Node.js, Express, MongoDB, and JWT authentication.

**Repository:** https://github.com/RAVINIVASAN/Turf-Booking-Management-System

---

**Last Updated:** April 2025
**Status:** Production Ready ✅
