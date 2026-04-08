# Turf Booking Management System - Day 3 API Documentation

## 🚀 Turf Management APIs

### Prerequisites
1. MongoDB Atlas connection string in `.env` file
2. Server running on `http://localhost:5000`
3. Postman or Thunder Client installed for testing

---

## API Endpoints

### 1. Add Turf (Create)
**Method:** `POST`
**Endpoint:** `/api/turfs/add`
**Auth Required:** No (can be protected later)

**Request Body:**
```json
{
  "name": "Green Park Turf",
  "description": "Premium turf with excellent facilities",
  "location": "Bangalore, Karnataka",
  "latitude": 12.9352,
  "longitude": 77.6245,
  "priceSlots": {
    "morning": 500,
    "afternoon": 700,
    "evening": 1000
  },
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "amenities": ["WiFi", "Parking", "Changing Room", "Water Facility"],
  "phoneNumber": "+91-9876543210",
  "email": "info@greenpark.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Turf added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Green Park Turf",
    "description": "Premium turf with excellent facilities",
    "location": "Bangalore, Karnataka",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "priceSlots": {
      "morning": 500,
      "afternoon": 700,
      "evening": 1000
    },
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "amenities": ["WiFi", "Parking", "Changing Room", "Water Facility"],
    "phoneNumber": "+91-9876543210",
    "email": "info@greenpark.com",
    "rating": 0,
    "isActive": true,
    "createdAt": "2026-04-08T10:30:00.000Z",
    "updatedAt": "2026-04-08T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: name, location, latitude, longitude, phoneNumber"
}
```

---

### 2. Get All Turfs
**Method:** `GET`
**Endpoint:** `/api/turfs`
**Auth Required:** No

**Query Parameters:** None required

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Green Park Turf",
      "location": "Bangalore, Karnataka",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "priceSlots": {...},
      "rating": 0,
      "isActive": true,
      "createdAt": "2026-04-08T10:30:00.000Z",
      "updatedAt": "2026-04-08T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Elite Sports Arena",
      "location": "Pune, Maharashtra",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "priceSlots": {...},
      "rating": 4.5,
      "isActive": true,
      "createdAt": "2026-04-08T11:00:00.000Z",
      "updatedAt": "2026-04-08T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Turf by ID
**Method:** `GET`
**Endpoint:** `/api/turfs/:id`
**Auth Required:** No

**URL Parameters:**
- `id` (required): MongoDB ObjectId of the turf (e.g., `507f1f77bcf86cd799439011`)

**Example Request:**
```
GET http://localhost:5000/api/turfs/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Green Park Turf",
    "description": "Premium turf with excellent facilities",
    "location": "Bangalore, Karnataka",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "priceSlots": {
      "morning": 500,
      "afternoon": 700,
      "evening": 1000
    },
    "images": [...],
    "amenities": ["WiFi", "Parking", "Changing Room", "Water Facility"],
    "phoneNumber": "+91-9876543210",
    "email": "info@greenpark.com",
    "rating": 0,
    "isActive": true,
    "createdAt": "2026-04-08T10:30:00.000Z",
    "updatedAt": "2026-04-08T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Turf not found"
}
```

---

### 4. Get Nearby Turfs (Location-Based Filtering) ⭐
**Method:** `GET`
**Endpoint:** `/api/turfs/nearby`
**Auth Required:** No

**Query Parameters:**
- `latitude` (required): User's latitude as a number (e.g., `12.9352`)
- `longitude` (required): User's longitude as a number (e.g., `77.6245`)
- `maxDistance` (optional): Maximum distance in kilometers (default: 10 km)

**Example Request:**
```
GET http://localhost:5000/api/turfs/nearby?latitude=12.9352&longitude=77.6245&maxDistance=15
```

**Success Response (200):**
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
      "_id": "507f1f77bcf86cd799439011",
      "name": "Green Park Turf",
      "location": "Bangalore, Karnataka",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "priceSlots": {...},
      "distance": 0,
      "rating": 0,
      "isActive": true
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Victory Sports",
      "location": "Whitefield, Bangalore",
      "latitude": 12.9469,
      "longitude": 77.6999,
      "priceSlots": {...},
      "distance": 5.42,
      "rating": 4.2,
      "isActive": true
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Champions Ground",
      "location": "Koramangala, Bangalore",
      "latitude": 12.9352,
      "longitude": 77.6500,
      "priceSlots": {...},
      "distance": 2.15,
      "rating": 4.8,
      "isActive": true
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide latitude and longitude query parameters"
}
```

---

### 5. Update Turf
**Method:** `PUT`
**Endpoint:** `/api/turfs/:id`
**Auth Required:** No (can be protected later)

**URL Parameters:**
- `id` (required): MongoDB ObjectId of the turf

**Request Body:** (Send only fields you want to update)
```json
{
  "name": "Green Park Turf - Updated",
  "priceSlots": {
    "morning": 600,
    "afternoon": 800,
    "evening": 1100
  },
  "rating": 4.5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Turf updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Green Park Turf - Updated",
    "description": "Premium turf with excellent facilities",
    "priceSlots": {
      "morning": 600,
      "afternoon": 800,
      "evening": 1100
    },
    "rating": 4.5,
    ...
  }
}
```

---

### 6. Delete Turf
**Method:** `DELETE`
**Endpoint:** `/api/turfs/:id`
**Auth Required:** No (can be protected later)

**URL Parameters:**
- `id` (required): MongoDB ObjectId of the turf

**Example Request:**
```
DELETE http://localhost:5000/api/turfs/507f1f77bcf86cd799439011
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Turf deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Turf not found"
}
```

---

## 📍 Location-Based Filtering Explained

The system uses the **Haversine Formula** to calculate the distance between user location and turfs:

```
Distance = R × arccos(sin(lat1) × sin(lat2) + cos(lat1) × cos(lat2) × cos(|lon2 - lon1|))
```

Where:
- R = 6371 km (Earth's radius)
- lat1, lon1 = User's coordinates
- lat2, lon2 = Turf's coordinates

**Features:**
- ✅ Returns turfs sorted by distance (nearest first)
- ✅ Filters turfs within `maxDistance` km
- ✅ Default distance is 10 km
- ✅ Distance shown in response for each turf

---

## 🧪 Postman Testing Steps

### Step 1: Add a Test Turf
1. Create `POST` request to `http://localhost:5000/api/turfs/add`
2. Set `Content-Type: application/json`
3. Paste the request body from **Add Turf** section above
4. Click **Send**
5. Copy the returned `_id` for next tests

### Step 2: Get All Turfs
1. Create `GET` request to `http://localhost:5000/api/turfs`
2. Click **Send**
3. Verify all turfs are returned

### Step 3: Get Single Turf
1. Create `GET` request to `http://localhost:5000/api/turfs/{TURF_ID}`
2. Replace `{TURF_ID}` with the ID from Step 1
3. Click **Send**

### Step 4: Get Nearby Turfs (Location Filter)
1. Create `GET` request to:
   ```
   http://localhost:5000/api/turfs/nearby?latitude=12.9352&longitude=77.6245&maxDistance=20
   ```
2. Use your location coordinates
3. Click **Send**
4. View results sorted by distance

### Step 5: Update Turf
1. Create `PUT` request to `http://localhost:5000/api/turfs/{TURF_ID}`
2. Set `Content-Type: application/json`
3. Send partial update:
   ```json
   {
     "name": "Updated Turf Name",
     "rating": 4.8
   }
   ```
4. Click **Send**

### Step 6: Delete Turf
1. Create `DELETE` request to `http://localhost:5000/api/turfs/{TURF_ID}`
2. Click **Send**
3. Verify deletion message

---

## ✅ Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad Request (validation error) |
| 404 | Not Found (turf doesn't exist) |
| 500 | Server Error |

---

## 🔒 Security & Validation

- ✅ Email validation (lowercase conversion)
- ✅ Latitude range: -90 to 90
- ✅ Longitude range: -180 to 180
- ✅ MongoDB ID validation
- ✅ Required field validation
- ✅ Price range validation (non-negative)
- ✅ Rating range: 0 to 5

---

## 📝 Example Request in cURL

```bash
# Add Turf
curl -X POST http://localhost:5000/api/turfs/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Green Park Turf",
    "location": "Bangalore",
    "latitude": 12.9352,
    "longitude": 77.6245,
    "phoneNumber": "+91-9876543210"
  }'

# Get Nearby Turfs
curl http://localhost:5000/api/turfs/nearby?latitude=12.9352&longitude=77.6245&maxDistance=15

# Get All Turfs
curl http://localhost:5000/api/turfs
```

---

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Ensure `MONGO_URI` is set correctly in `.env`
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database`

**Port Already in Use:**
- Change `PORT` in `.env` file
- Or kill process: `lsof -i :5000`

**Route Not Found:**
- Ensure server is running with correct routes
- Check `/api/turfs` is properly registered in `server.js`

---

## 📚 Next Steps (Day 4)

- Implement booking management APIs
- Add authentication middleware
- Create payment integration
- Add rating and review system
