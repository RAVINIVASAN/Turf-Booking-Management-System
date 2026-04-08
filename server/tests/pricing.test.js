/**
 * Pricing Utility Test Cases
 * Run this file to test all pricing scenarios:
 * node server/tests/pricing.test.js
 */

const {
  calculateDynamicPrice,
  getTimeSlotCategory,
  calculateBasePrice,
  applyPeakPricing,
  applyDemandPricing,
  getTimeSlotsByCategory,
} = require('../utils/pricing');

// Default price slots for testing
const defaultPriceSlots = {
  morning: 500,
  afternoon: 700,
  evening: 1000,
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}━━━ ${text} ━━━${colors.reset}`),
  success: (text) => console.log(`${colors.green}✓ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}ℹ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}✗ ${text}${colors.reset}`),
};

// Test Case 1: Morning Booking (No Peak, No Demand)
function testMorningBooking() {
  log.title('Test 1: Morning Booking');

  const result = calculateDynamicPrice(defaultPriceSlots, '8AM-9AM', 1, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 100,
  });

  log.info(`Time Slot: 8AM-9AM (Morning)`);
  log.info(`Existing Bookings: 1`);
  log.info(`Expected Base Price: ₹500`);
  log.info(`Expected Final Price: ₹500 (no peak, no demand)`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Peak Multiplier: ${(result.pricing.peakMultiplier * 100).toFixed(0)}%
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Demand Adjustment: ₹${result.pricing.demandAdjustment}
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 500) {
      log.success('Test PASSED: Morning booking price is correct');
    } else {
      log.error(`Test FAILED: Expected ₹500, got ₹${result.pricing.finalPrice}`);
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 2: Evening Peak Booking (Peak, No Demand)
function testEveningPeakBooking() {
  log.title('Test 2: Evening Peak Booking (7PM-8PM)');

  const result = calculateDynamicPrice(defaultPriceSlots, '7PM-8PM', 2, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 100,
  });

  log.info(`Time Slot: 7PM-8PM (Evening - Peak)`);
  log.info(`Existing Bookings: 2`);
  log.info(`Expected Base Price: ₹1000`);
  log.info(`Expected Peak Multiplier: 1.5x (50% increase)`);
  log.info(`Expected Final Price: ₹1500`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Peak Multiplier: ${(result.pricing.peakMultiplier * 100).toFixed(0)}%
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Is Peak Time: ${result.pricing.isPeakTime}
  - Demand Adjustment: ₹${result.pricing.demandAdjustment}
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 1500 && result.pricing.isPeakTime) {
      log.success('Test PASSED: Evening peak pricing is correct');
    } else {
      log.error(
        `Test FAILED: Expected ₹1500 and isPeakTime=true, got ₹${result.pricing.finalPrice}/${result.pricing.isPeakTime}`
      );
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 3: Afternoon Booking with Demand Surge
function testDemandSurge() {
  log.title('Test 3: Afternoon Booking with Demand Surge');

  const result = calculateDynamicPrice(defaultPriceSlots, '2PM-3PM', 4, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 100,
  });

  log.info(`Time Slot: 2PM-3PM (Afternoon)`);
  log.info(`Existing Bookings: 4 (exceeds threshold of 3)`);
  log.info(`Expected Base Price: ₹700`);
  log.info(`Expected Price After Peak: ₹770 (10% increase)`);
  log.info(`Expected Demand Adjustment: ₹100 (1 excess booking × ₹100)`);
  log.info(`Expected Final Price: ₹870`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Peak Multiplier: ${(result.pricing.peakMultiplier * 100).toFixed(0)}%
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Demand Applied: ${result.pricing.demandApplied}
  - Demand Adjustment: ₹${result.pricing.demandAdjustment}
  - Total Increase: ${result.pricing.percentageIncrease}%
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 870 && result.pricing.demandApplied) {
      log.success('Test PASSED: Demand surge pricing is correct');
    } else {
      log.error(
        `Test FAILED: Expected ₹870 with demand, got ₹${result.pricing.finalPrice}`
      );
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 4: Evening Peak with High Demand
function testEveningPeakWithHighDemand() {
  log.title('Test 4: Evening Peak with High Demand');

  const result = calculateDynamicPrice(defaultPriceSlots, '8PM-9PM', 5, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 100,
  });

  log.info(`Time Slot: 8PM-9PM (Evening - Peak)`);
  log.info(`Existing Bookings: 5 (high demand)`);
  log.info(`Expected Base Price: ₹1000`);
  log.info(`Expected Price After Peak: ₹1500 (50% increase)`);
  log.info(`Expected Demand Adjustment: ₹200 (2 excess bookings × ₹100)`);
  log.info(`Expected Final Price: ₹1700`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Peak Multiplier: ${(result.pricing.peakMultiplier * 100).toFixed(0)}%
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Is Peak Time: ${result.pricing.isPeakTime}
  - Demand Applied: ${result.pricing.demandApplied}
  - Demand Adjustment: ₹${result.pricing.demandAdjustment}
  - Total Increase: ${result.pricing.percentageIncrease}%
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 1700 && result.pricing.demandApplied) {
      log.success('Test PASSED: Evening peak with demand pricing is correct');
    } else {
      log.error(
        `Test FAILED: Expected ₹1700, got ₹${result.pricing.finalPrice}`
      );
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 5: Custom Pricing
function testCustomPricing() {
  log.title('Test 5: Custom Turf Pricing');

  const customPricing = {
    morning: 800,
    afternoon: 1200,
    evening: 2000,
  };

  const result = calculateDynamicPrice(customPricing, '7PM-8PM', 1, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 150,
  });

  log.info(`Turf: Premium Cricket Ground`);
  log.info(`Time Slot: 7PM-8PM (Evening)`);
  log.info(`Custom Pricing: Morning ₹800, Afternoon ₹1200, Evening ₹2000`);
  log.info(`Expected Base Price: ₹2000`);
  log.info(`Expected Final Price: ₹3000 (1.5x peak multiplier)`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Peak Multiplier: ${(result.pricing.peakMultiplier * 100).toFixed(0)}%
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 3000) {
      log.success('Test PASSED: Custom pricing is calculated correctly');
    } else {
      log.error(`Test FAILED: Expected ₹3000, got ₹${result.pricing.finalPrice}`);
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 6: Invalid Time Slot
function testInvalidTimeSlot() {
  log.title('Test 6: Invalid Time Slot');

  const result = calculateDynamicPrice(defaultPriceSlots, 'INVALID-TIME', 1, {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 100,
  });

  log.info(`Time Slot: INVALID-TIME`);
  log.info(`Expected: Error response`);

  if (!result.success) {
    log.success(`Test PASSED: Invalid time slot correctly rejected (${result.message})`);
  } else {
    log.error('Test FAILED: Invalid time slot was accepted');
  }
}

// Test Case 7: Demand Pricing Disabled
function testDemandPricingDisabled() {
  log.title('Test 7: Demand Pricing Disabled');

  const result = calculateDynamicPrice(defaultPriceSlots, '2PM-3PM', 5, {
    enableDemandPricing: false,
  });

  log.info(`Time Slot: 2PM-3PM (Afternoon)`);
  log.info(`Existing Bookings: 5`);
  log.info(`Demand Pricing: DISABLED`);
  log.info(`Expected Final Price: ₹770 (no demand adjustment)`);

  if (result.success) {
    console.log(`
  Pricing Breakdown:
  - Base Price: ₹${result.pricing.basePrice}
  - Price After Peak: ₹${result.pricing.priceAfterPeakMultiplier}
  - Demand Applied: ${result.pricing.demandApplied}
  - Demand Adjustment: ₹${result.pricing.demandAdjustment}
  - Final Price: ₹${result.pricing.finalPrice}
    `);

    if (result.pricing.finalPrice === 770 && !result.pricing.demandApplied) {
      log.success('Test PASSED: Demand pricing correctly disabled');
    } else {
      log.error(
        `Test FAILED: Expected ₹770, got ₹${result.pricing.finalPrice}`
      );
    }
  } else {
    log.error('Test FAILED: ' + result.message);
  }
}

// Test Case 8: Time Slot Categories
function testTimeSlotCategories() {
  log.title('Test 8: Time Slot Categories');

  const testSlots = [
    { slot: '6AM-7AM', expectedCategory: 'morning', expectedPeak: false },
    { slot: '2PM-3PM', expectedCategory: 'afternoon', expectedPeak: false },
    { slot: '7PM-8PM', expectedCategory: 'evening', expectedPeak: true },
  ];

  testSlots.forEach(({ slot, expectedCategory, expectedPeak }) => {
    const category = getTimeSlotCategory(slot);

    if (
      category &&
      category.category === expectedCategory &&
      category.isPeakTime === expectedPeak
    ) {
      log.success(`${slot} → ${expectedCategory} (peak: ${expectedPeak})`);
    } else {
      log.error(
        `${slot} → Expected ${expectedCategory}, got ${category?.category}`
      );
    }
  });
}

// Summary Report
function printSummary() {
  log.title('Pricing System Test Summary');
  console.log(`
  This test suite validates:
  ✓ Base price calculation by time slot category
  ✓ Peak hour multipliers (morning 1.0x, afternoon 1.1x, evening 1.5x)
  ✓ Demand-based surge pricing (after 3 bookings)
  ✓ Custom turf pricing
  ✓ Error handling for invalid slots
  ✓ Toggle for demand pricing on/off

  Time Categories:
  - Morning (6AM-10AM): Base × 1.0x = No surcharge
  - Afternoon (10AM-4PM): Base × 1.1x = +10%
  - Evening (4PM-10PM): Base × 1.5x = +50% (PEAK HOURS)

  Demand Surge (when enabled):
  - Threshold: 3 bookings
  - Surge: ₹100 per booking beyond threshold
  `);
}

// Run all tests
console.log(`${colors.bright}${colors.green}
╔════════════════════════════════════════════════════════════════╗
║        TURF BOOKING DYNAMIC PRICING SYSTEM - TEST SUITE        ║
║                        Day 5 Testing                           ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

testMorningBooking();
testEveningPeakBooking();
testDemandSurge();
testEveningPeakWithHighDemand();
testCustomPricing();
testInvalidTimeSlot();
testDemandPricingDisabled();
testTimeSlotCategories();
printSummary();

console.log(`\n${colors.bright}${colors.green}✓ All tests completed!${colors.reset}\n`);
