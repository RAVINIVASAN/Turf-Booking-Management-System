# Day 5: Dynamic Pricing System - Complete Guide

## 🎯 Overview

The Dynamic Pricing System calculates booking prices based on:
1. **Base Price** - By time slot category (morning, afternoon, evening)
2. **Peak Hour Multiplier** - Evening slots get 50% price increase
3. **Demand-Based Pricing** - Additional surge when more than 3 bookings exist on same date

---

## 📊 Time Slot Categories & Default Prices

### Morning (6AM - 10AM)
- Slots: 6AM-7AM, 7AM-8AM, 8AM-9AM, 9AM-10AM
- Base Price: ₹500
- Peak Multiplier: 1.0x (no increase)

### Afternoon (10AM - 4PM)
- Slots: 10AM-11AM, 11AM-12PM, 12PM-1PM, 1PM-2PM, 2PM-3PM, 3PM-4PM, 4PM-5PM, 5PM-6PM
- Base Price: ₹700
- Peak Multiplier: 1.1x (10% increase)

### Evening (4PM - 10PM) ⭐ PEAK HOURS
- Slots: 6PM-7PM, 7PM-8PM, 8PM-9PM, 9PM-10PM
- Base Price: ₹1000
- Peak Multiplier: 1.5x (50% increase) ⚡

---

## 💰 Pricing Calculation Examples

### Example 1: Morning Booking (No Peak, No Demand)
```
Scenario:
- Turf: Cricket Ground with default pricing
- Time Slot: 8AM-9AM (Morning)
- Date: 2025-04-15
- Existing Bookings on this date: 1

Calculation:
Step 1 (Base Price):     ₹500 (morning slot)
Step 2 (Peak Multiplier): ₹500 × 1.0 = ₹500 (no peak adjustment)
Step 3 (Demand Pricing):  1 booking < 3 threshold = No surge pricing

FINAL PRICE: ₹500
```

**API Response:**
```json
{
  "success": true,
  "pricingInfo": {
    "basePrice": 500,
    "priceAfterPeakMultiplier": 500,
    "peakMultiplier": "100%",
    "isPeakTime": false,
    "demandAdjustment": 0,
    "demandApplied": false,
    "percentageIncrease": "0%",
    "finalPrice": 500,
    "priceCategory": "Morning"
  }
}
```

---

### Example 2: Evening Peak Hour Booking (Peak, No Demand)
```
Scenario:
- Turf: Cricket Ground with default pricing
- Time Slot: 7PM-8PM (Evening - Peak Hours)
- Date: 2025-04-15
- Existing Bookings on this date: 2

Calculation:
Step 1 (Base Price):     ₹1000 (evening slot)
Step 2 (Peak Multiplier): ₹1000 × 1.5 = ₹1500 (50% peak increase)
Step 3 (Demand Pricing):  2 bookings < 3 threshold = No surge pricing

FINAL PRICE: ₹1500 (50% more than morning)
Savings by booking morning: ₹1000
```

**API Response:**
```json
{
  "success": true,
  "pricingInfo": {
    "basePrice": 1000,
    "priceAfterPeakMultiplier": 1500,
    "peakMultiplier": "150%",
    "isPeakTime": true,
    "demandAdjustment": 0,
    "demandApplied": false,
    "percentageIncrease": "0%",
    "finalPrice": 1500,
    "priceCategory": "Evening"
  }
}
```

---

### Example 3: Afternoon Booking with Demand Surge

```
Scenario:
- Turf: Cricket Ground with default pricing
- Time Slot: 2PM-3PM (Afternoon)
- Date: 2025-04-15
- Existing Bookings on this date: 4 (exceeds threshold of 3)

Calculation:
Step 1 (Base Price):     ₹700 (afternoon slot)
Step 2 (Peak Multiplier): ₹700 × 1.1 = ₹770 (10% peak adjustment)
Step 3 (Demand Pricing):
  - Existing bookings: 4
  - Threshold: 3
  - Excess bookings: 4 - 3 = 1
  - Surge per booking: ₹100
  - Demand adjustment: 1 × ₹100 = ₹100
  - Final Price: ₹770 + ₹100 = ₹870

FINAL PRICE: ₹870 (14% increase due to demand)
```

**API Response:**
```json
{
  "success": true,
  "pricingInfo": {
    "basePrice": 700,
    "priceAfterPeakMultiplier": 770,
    "peakMultiplier": "110%",
    "isPeakTime": false,
    "demandAdjustment": 100,
    "demandApplied": true,
    "percentageIncrease": "14%",
    "finalPrice": 870,
    "priceCategory": "Afternoon"
  }
}
```

---

### Example 4: Evening Peak with High Demand 🔥

```
Scenario:
- Turf: Popular Cricket Ground
- Time Slot: 8PM-9PM (Evening - Peak Hours)
- Date: 2025-04-15 (Saturday - very popular)
- Existing Bookings on this date: 5 (very high demand)

Calculation:
Step 1 (Base Price):     ₹1000 (evening slot)
Step 2 (Peak Multiplier): ₹1000 × 1.5 = ₹1500 (50% peak increase)
Step 3 (Demand Pricing):
  - Existing bookings: 5
  - Threshold: 3
  - Excess bookings: 5 - 3 = 2
  - Surge per booking: ₹100
  - Demand adjustment: 2 × ₹100 = ₹200
  - Final Price: ₹1500 + ₹200 = ₹1700

FINAL PRICE: ₹1700 (70% more than morning)
Premium for peak + demand: ₹1200 extra!
```

**API Response:**
```json
{
  "success": true,
  "pricingInfo": {
    "basePrice": 1000,
    "priceAfterPeakMultiplier": 1500,
    "peakMultiplier": "150%",
    "isPeakTime": true,
    "demandAdjustment": 200,
    "demandApplied": true,
    "percentageIncrease": "13%",
    "finalPrice": 1700,
    "priceCategory": "Evening"
  }
}
```

---

## 🧪 Testing All Scenarios with Postman

### Test Case 1: Morning Booking (Low Price)

**Request:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "TURF_ID",
  "date": "2025-04-15",
  "timeSlot": "8AM-9AM",
  "totalPlayers": 11
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "pricingInfo": {
    "basePrice": 500,
    "priceAfterPeakMultiplier": 500,
    "finalPrice": 500,
    "isPeakTime": false,
    "priceCategory": "Morning"
  }
}
```

---

### Test Case 2: Evening Booking (Peak Hours - Higher Price)

**Request:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "TURF_ID",
  "date": "2025-04-15",
  "timeSlot": "7PM-8PM",
  "totalPlayers": 11
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "pricingInfo": {
    "basePrice": 1000,
    "priceAfterPeakMultiplier": 1500,
    "finalPrice": 1500,
    "isPeakTime": true,
    "priceCategory": "Evening"
  }
}
```

**Observation:** Evening price is 3x morning price!

---

### Test Case 3: Create Multiple Bookings and Check Demand Surge

**Step 1:** Create 4 bookings for the same turf on same date:
- Booking 1: 8AM-9AM - Morning - ₹500
- Booking 2: 10AM-11AM - Afternoon - ₹700
- Booking 3: 12PM-1PM - Afternoon - ₹700
- Booking 4: 2PM-3PM - Afternoon - ₹??

**Request for Booking 4:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "TURF_ID",
  "date": "2025-04-15",
  "timeSlot": "2PM-3PM",
  "totalPlayers": 11
}
```

**Expected Response (Booking 4):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "pricingInfo": {
    "basePrice": 700,
    "priceAfterPeakMultiplier": 770,
    "demandAdjustment": 100,
    "demandApplied": true,
    "percentageIncrease": "14%",
    "finalPrice": 870,
    "priceCategory": "Afternoon"
  }
}
```

**Price Comparison:**
- Booking 1 (1st afternoon at 10AM): ₹700
- Booking 2 (2nd afternoon at 12PM): ₹700
- Booking 3 (3rd afternoon at 2PM): ₹700 (at threshold, no surge yet)
- Booking 4 (4th afternoon at 4PM): ₹870 (surge kicks in!)

---

### Test Case 4: Afternoon Booking with Custom Pricing

**Request:** Create turf with custom prices, then book:
```
POST http://localhost:5000/api/turfs/add
Content-Type: application/json

{
  "name": "Premium Cricket Ground",
  "location": "Mumbai",
  "latitude": 19.0757,
  "longitude": 72.8295,
  "priceSlots": {
    "morning": 800,
    "afternoon": 1200,
    "evening": 2000
  },
  "phoneNumber": "9876543210",
  "email": "premium@ground.com"
}
```

**Then book a slot:**
```
POST http://localhost:5000/api/bookings/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "turfId": "RETURNED_TURF_ID",
  "date": "2025-04-15",
  "timeSlot": "7PM-8PM",
  "totalPlayers": 11
}
```

**Expected Response:**
```json
{
  "success": true,
  "pricingInfo": {
    "basePrice": 2000,
    "priceAfterPeakMultiplier": 3000,
    "peakMultiplier": "150%",
    "finalPrice": 3000,
    "isPeakTime": true,
    "priceCategory": "Evening"
  }
}
```

---

## 🔑 Pricing Configuration

### Current Settings (in bookingController.js):

```javascript
const pricingResult = calculateDynamicPrice(
  turf.priceSlots,
  timeSlot,
  bookingCountOnDate,
  {
    enableDemandPricing: true,
    demandThreshold: 3,      // Apply surge after 3 bookings
    demandMultiplier: 100,   // Add ₹100 per excess booking
  }
);
```

### To Customize:

**Option 1: Increase Demand Threshold**
```javascript
demandThreshold: 5  // Apply surge after 5 bookings instead of 3
```

**Option 2: Increase Surge Amount**
```javascript
demandMultiplier: 200  // Add ₹200 per excess booking instead of ₹100
```

**Option 3: Disable Demand Pricing**
```javascript
enableDemandPricing: false  // Only use base price + peak multiplier
```

---

## 📈 Pricing Formula

```
FINAL PRICE = [BASE_PRICE × PEAK_MULTIPLIER] + DEMAND_ADJUSTMENT

Where:
- BASE_PRICE = Price from priceSlots (morning/afternoon/evening)
- PEAK_MULTIPLIER = 1.0 (morning), 1.1 (afternoon), 1.5 (evening)
- DEMAND_ADJUSTMENT = 0 if bookings ≤ threshold
                    = (bookings - threshold) × multiplier if bookings > threshold
```

---

## 📊 Price Comparison Chart

**For Default Pricing (Morning ₹500, Afternoon ₹700, Evening ₹1000):**

| Scenario | Base Price | Peak × Multiplier | Demand Surge | Final Price | Increase |
|----------|-----------|------------------|--------------|-------------|----------|
| 1st Morning | ₹500 | × 1.0 = ₹500 | ₹0 | **₹500** | - |
| 1st Afternoon | ₹700 | × 1.1 = ₹770 | ₹0 | **₹770** | +54% |
| 1st Evening | ₹1000 | × 1.5 = ₹1500 | ₹0 | **₹1500** | +200% |
| 4th Afternoon | ₹700 | × 1.1 = ₹770 | ₹100 | **₹870** | +74% |
| 4th Evening | ₹1000 | × 1.5 = ₹1500 | ₹100 | **₹1600** | +220% |
| 6th Evening | ₹1000 | × 1.5 = ₹1500 | ₹300 | **₹1800** | +260% |

---

## 🎯 Key Features

✅ **Time-Based Pricing** - Different prices for morning, afternoon, evening
✅ **Peak Hour Surcharge** - Evening slots cost 50% more (1.5x multiplier)
✅ **Demand Multiplier** - Automatic surge pricing when demand is high
✅ **Dynamic Calculation** - Price changes based on real-time bookings
✅ **Full Transparency** - API returns complete price breakdown
✅ **Database Storage** - All pricing details stored for analytics
✅ **Customizable Thresholds** - Easy to adjust demand surge settings

---

## 💾 Database Schema Update

The Booking model now stores complete pricing breakdown:

```javascript
priceBreakdown: {
  basePrice: Number,
  peakMultiplier: Number,
  priceAfterPeakMultiplier: Number,
  isPeakTime: Boolean,
  demandAdjustment: Number,
  demandApplied: Boolean,
  percentageIncrease: Number
}

priceCategory: String,  // 'morning', 'afternoon', 'evening'
categoryLabel: String,  // 'Morning', 'Afternoon', 'Evening'
```

---

## 📝 API Request/Response Example

**Request:**
```
POST /api/bookings/create
Authorization: Bearer eyJhbGc...
{
  "turfId": "61a8c0c0...",
  "date": "2025-04-15",
  "timeSlot": "7PM-8PM",
  "totalPlayers": 11
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "pricingInfo": {
    "basePrice": 1000,
    "priceAfterPeakMultiplier": 1500,
    "peakMultiplier": "150%",
    "isPeakTime": true,
    "demandAdjustment": 100,
    "demandApplied": true,
    "percentageIncrease": "7%",
    "finalPrice": 1600,
    "priceCategory": "Evening"
  },
  "data": {
    "_id": "booking123...",
    "userId": { ... },
    "turfId": { ... },
    "date": "2025-04-15T00:00:00.000Z",
    "timeSlot": "7PM-8PM",
    "price": 1600,
    "priceBreakdown": {
      "basePrice": 1000,
      "peakMultiplier": 1.5,
      "priceAfterPeakMultiplier": 1500,
      "isPeakTime": true,
      "demandAdjustment": 100,
      "demandApplied": true,
      "percentageIncrease": 7
    },
    "priceCategory": "evening",
    "categoryLabel": "Evening",
    "paymentStatus": "pending",
    "bookingStatus": "confirmed",
    "createdAt": "2025-04-08T10:30:00.000Z"
  }
}
```

---

## ⚙️ Utility Functions Reference

Located in `server/utils/pricing.js`:

### `calculateDynamicPrice(priceSlots, timeSlot, bookingCount, options)`
Main function that calculates complete price breakdown.

### `getTimeSlotCategory(timeSlot)`
Returns category (morning/afternoon/evening) and peak info for a time slot.

### `calculateBasePrice(priceSlots, timeSlot)`
Calculates base price for a given time slot.

### `applyPeakPricing(basePrice, isPeakTime, peakMultiplier)`
Applies peak hour multiplier to base price.

### `applyDemandPricing(currentPrice, bookingCount, config)`
Applies surge pricing based on booking count.

### `getTimeSlotsByCategory()`
Returns all time slots grouped by category.

---

## 🚀 Next Steps

Potential enhancements:
- Add seasonal pricing (weekends vs weekdays)
- Implement loyalty discounts for repeat customers
- Add advance booking discounts (book 2 weeks ahead = 10% off)
- Weather-based pricing adjustments
- Holiday surcharges (premium on public holidays)
- Integration with payment gateway for final charge

---

## 📋 Testing Checklist

- [ ] Morning booking price = base price (₹500)
- [ ] Afternoon booking price = base × 1.1 (₹770)
- [ ] Evening booking price = base × 1.5 (₹1500)
- [ ] No surge for 1-3 bookings on same date
- [ ] Surge applies from 4th booking onwards (₹100 per extra)
- [ ] Custom turf pricing works correctly
- [ ] Price stored in database with breakdown
- [ ] API response includes detailed pricing info
