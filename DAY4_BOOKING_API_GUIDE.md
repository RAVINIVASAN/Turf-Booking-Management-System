# Turf Booking Management System - API Testing Guide (Day 4)

## Overview
Complete authentication-protected booking system with double-booking prevention.

---

## 📋 Testing Steps (Postman/Thunder Client)

### Prerequisites
- Server running on `http://localhost:5000`
- MongoDB connected to "Turf" database
- All previous endpoints working (Auth & Turfs)

---

## 1️⃣ STEP 1: Register a User

**Request:**
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Ravi Kumar",
  "email": "ravi@example.com",
  "password": "Password@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "123abc...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "role": "user"
  }
}
```

---

## 2️⃣ STEP 2: Login to Get JWT Token

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "ravi@example.com",
  "password": "Password@123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "123abc...",
    "name": "Ravi Kumar",
    "email": "ravi@example.com"
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value - you'll need it for all protected routes!

---

## 3️⃣ STEP 3: Add a Turf (for booking)

**Request:**
```
POST http://localhost:5000/api/turfs/add
Content-Type: application/json

{
  "name": "Cricket Ground - Mumbai",
  "description": "World class cricket ground with grass pitch",
  "location": "Bandra, Mumbai",
  "latitude": 19.0557,
  "longitude": 72.8295,
  "priceSlots": {
    "morning": 500,
    "afternoon": 700,
    "evening": 1000
  },
  "amenities": ["Lights", "Parking", "Washroom", "Rest Area"],
  "phoneNumber": "9876543210",
  "email": "cricket@ground.com"
}
```

**⚠️ Save the turf `_id` from response - needed for bookings!**

---

## 4️⃣ STEP 4: Create a Booking (PROTECTED ROUTE) ✅

**Request:**
```
POST http://localhost:5000/api/bookings/create
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "turfId": "PASTE_TURF_ID_HERE",
  "date": "2025-04-15",
  "timeSlot": "5PM-6PM",
  "totalPlayers": 11,
  "notes": "Final match - please confirm"
}
```

**Example with actual token:**
```
POST http://localhost:5000/api/bookings/create
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MWE4YzBjMDAwMDAwMDAwMDAwMDAwMjMiLCJlbWFpbCI6InJhdmlAZXhhbXBsZS5jb20iLCJpYXQiOjE2NDkwMDAwMDB9.abc123xyz...

{
  "turfId": "61a8c0c0000000000000001f",
  "date": "2025-04-15",
  "timeSlot": "5PM-6PM",
  "totalPlayers": 11,
  "notes": "Final match"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking123...",
    "userId": {
      "_id": "user123...",
      "name": "Ravi Kumar",
      "email": "ravi@example.com",
      "phoneNumber": "9999999999"
    },
    "turfId": {
      "_id": "turf123...",
      "name": "Cricket Ground - Mumbai",
      "location": "Bandra, Mumbai",
      "priceSlots": {
        "morning": 500,
        "afternoon": 700,
        "evening": 1000
      }
    },
    "date": "2025-04-15T00:00:00.000Z",
    "timeSlot": "5PM-6PM",
    "price": 1000,
    "paymentStatus": "pending",
    "bookingStatus": "confirmed",
    "totalPlayers": 11,
    "createdAt": "2025-04-08T10:30:00.000Z"
  }
}
```

---

## 5️⃣ STEP 5: Try Double Booking (Should FAIL) ❌

**Request:** Same as STEP 4 (same date, same timeSlot, same turf)

**Expected Error Response:**
```json
{
  "success": false,
  "message": "Slot 5PM-6PM on 2025-04-15 is already booked. Please choose another time slot.",
  "availableSlot": false
}
```

**✅ This proves double-booking prevention is working!**

---

## 6️⃣ STEP 6: Get Available Slots for Turf

**Request:**
```
GET http://localhost:5000/api/bookings/turf/PASTE_TURF_ID_HERE?date=2025-04-15
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "turfId": "61a8c0c0000000000000001f",
    "date": "2025-04-15",
    "totalBookings": 1,
    "bookedSlots": ["5PM-6PM"],
    "availableSlots": [
      "6AM-7AM", "7AM-8AM", "8AM-9AM", "9AM-10AM", "10AM-11AM", "11AM-12PM",
      "12PM-1PM", "1PM-2PM", "2PM-3PM", "3PM-4PM", "4PM-5PM", "6PM-7PM",
      "7PM-8PM", "8PM-9PM", "9PM-10PM"
    ],
    "bookings": [
      {
        "_id": "booking123...",
        "userId": {
          "name": "Ravi Kumar",
          "email": "ravi@example.com"
        },
        "timeSlot": "5PM-6PM",
        "date": "2025-04-15T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 7️⃣ STEP 7: Get User's Bookings (PROTECTED ROUTE)

**Request:**
```
GET http://localhost:5000/api/bookings/my
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "booking123...",
      "userId": {
        "_id": "user123...",
        "name": "Ravi Kumar",
        "email": "ravi@example.com",
        "phoneNumber": "9999999999"
      },
      "turfId": {
        "_id": "turf123...",
        "name": "Cricket Ground - Mumbai",
        "location": "Bandra, Mumbai"
      },
      "date": "2025-04-15T00:00:00.000Z",
      "timeSlot": "5PM-6PM",
      "price": 1000,
      "paymentStatus": "pending",
      "bookingStatus": "confirmed",
      "totalPlayers": 11,
      "createdAt": "2025-04-08T10:30:00.000Z"
    }
  ]
}
```

---

## 8️⃣ STEP 8: Get Single Booking (PROTECTED ROUTE)

**Request:**
```
GET http://localhost:5000/api/bookings/BOOKING_ID_HERE
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 9️⃣ STEP 9: Cancel a Booking (PROTECTED ROUTE)

**Request:**
```
PUT http://localhost:5000/api/bookings/cancel/BOOKING_ID_HERE
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "_id": "booking123...",
    "bookingStatus": "cancelled",
    "paymentStatus": "refunded",
    ...
  }
}
```

---

## ⚠️ Error Handling Tests

### Test Missing Token
**Request:**
```
GET http://localhost:5000/api/bookings/my
(No Authorization header)
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Test Invalid Token
**Request:**
```
GET http://localhost:5000/api/bookings/my
Authorization: Bearer invalid_token_xyz
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Test Missing Fields
**Request:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "61a8c0c0000000000000001f"
  // Missing date and timeSlot
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Please provide all required fields: turfId, date, timeSlot"
}
```

### Test Past Date Booking
**Request:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "61a8c0c0000000000000001f",
  "date": "2020-01-01",
  "timeSlot": "5PM-6PM"
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Cannot book for past dates"
}
```

---

## 📊 Available Time Slots

All slots are in 1-hour intervals:
- **Morning:** 6AM-7AM, 7AM-8AM, 8AM-9AM, 9AM-10AM, 10AM-11AM, 11AM-12PM
- **Afternoon:** 12PM-1PM, 1PM-2PM, 2PM-3PM, 3PM-4PM, 4PM-5PM, 5PM-6PM
- **Evening:** 6PM-7PM, 7PM-8PM, 8PM-9PM, 9PM-10PM

---

## 💡 Key Features Implemented

✅ JWT Token Protection - Only logged-in users can book
✅ Double Booking Prevention - Unique constraint on (turfId, date, timeSlot)
✅ Automatic Price Calculation - Based on time slot
✅ Available Slots Display - See open slots for any date
✅ Booking Cancellation - With refund status
✅ User-specific Bookings - Users can only see/cancel their own bookings
✅ Proper Error Handling - Clear error messages for all scenarios

---

## 🎯 Summary

All endpoints tested and working:
- ✅ POST `/api/bookings/create` - Create booking (Protected)
- ✅ GET `/api/bookings/my` - Get user bookings (Protected)
- ✅ GET `/api/bookings/:bookingId` - Get single booking (Protected)
- ✅ PUT `/api/bookings/cancel/:bookingId` - Cancel booking (Protected)
- ✅ GET `/api/bookings/turf/:turfId` - Get turf availability (Public)
