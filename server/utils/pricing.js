/**
 * Dynamic Pricing Utility for Turf Booking System
 * Handles:
 * - Time slot categorization (morning, afternoon, evening)
 * - Peak hour pricing (evening slots get multiplier)
 * - Demand-based pricing (increases with more bookings)
 */

/**
 * Define time slot categories
 * Morning: 6AM - 10AM
 * Afternoon: 10AM - 4PM (16:00)
 * Evening: 4PM (16:00) - 10PM
 */
const TIME_SLOT_CATEGORIES = {
  morning: {
    slots: ['6AM-7AM', '7AM-8AM', '8AM-9AM', '9AM-10AM'],
    label: 'Morning',
    peakMultiplier: 1.0, // No peak multiplier for morning
  },
  afternoon: {
    slots: ['10AM-11AM', '11AM-12PM', '12PM-1PM', '1PM-2PM', '2PM-3PM', '3PM-4PM', '4PM-5PM', '5PM-6PM'],
    label: 'Afternoon',
    peakMultiplier: 1.1, // 10% increase for afternoon
  },
  evening: {
    slots: ['6PM-7PM', '7PM-8PM', '8PM-9PM', '9PM-10PM'],
    label: 'Evening',
    peakMultiplier: 1.5, // 50% increase for evening (peak hours)
  },
};

/**
 * Get time slot category (morning, afternoon, evening)
 * @param {String} timeSlot - Time slot string (e.g., "5PM-6PM")
 * @returns {Object} - { category, label, isPeakTime }
 */
const getTimeSlotCategory = (timeSlot) => {
  for (const [category, { slots, label, peakMultiplier }] of Object.entries(TIME_SLOT_CATEGORIES)) {
    if (slots.includes(timeSlot)) {
      return {
        category,
        label,
        isPeakTime: category === 'evening',
        peakMultiplier,
      };
    }
  }
  return null; // Invalid time slot
};

/**
 * Calculate base price based on time slot category
 * @param {Object} priceSlots - { morning, afternoon, evening }
 * @param {String} timeSlot - Time slot string
 * @returns {Object} - { basePrice, category, label }
 */
const calculateBasePrice = (priceSlots, timeSlot) => {
  const slotInfo = getTimeSlotCategory(timeSlot);

  if (!slotInfo) {
    return {
      error: 'Invalid time slot',
      basePrice: null,
    };
  }

  const basePrice = priceSlots[slotInfo.category];

  return {
    basePrice,
    category: slotInfo.category,
    label: slotInfo.label,
    isPeakTime: slotInfo.isPeakTime,
    peakMultiplier: slotInfo.peakMultiplier,
  };
};

/**
 * Apply peak hour pricing multiplier
 * @param {Number} basePrice - Base price
 * @param {Boolean} isPeakTime - Is peak hour
 * @param {Number} peakMultiplier - Price multiplier for peak hours
 * @returns {Number} - Price after peak adjustment
 */
const applyPeakPricing = (basePrice, isPeakTime, peakMultiplier = 1.0) => {
  if (!isPeakTime) {
    return basePrice;
  }
  return Math.round(basePrice * peakMultiplier);
};

/**
 * Apply demand-based pricing
 * Higher demand (more bookings) = higher price
 * @param {Number} currentPrice - Current price
 * @param {Number} bookingCount - Number of bookings for same turf on same date
 * @param {Object} config - Configuration for demand pricing
 *   - demandThreshold: bookings threshold (default: 3)
 *   - demandMultiplier: price increase per additional booking (default: 50)
 * @returns {Object} - { finalPrice, demandAdjustment, demandApplied }
 */
const applyDemandPricing = (
  currentPrice,
  bookingCount,
  config = { demandThreshold: 3, demandMultiplier: 50 }
) => {
  const { demandThreshold, demandMultiplier } = config;

  if (bookingCount <= demandThreshold) {
    return {
      finalPrice: currentPrice,
      demandAdjustment: 0,
      demandApplied: false,
      bookingCount,
    };
  }

  // Calculate increase: (bookings - threshold) * multiplier
  const excessBookings = bookingCount - demandThreshold;
  const demandAdjustment = Math.round(excessBookings * demandMultiplier);
  const finalPrice = currentPrice + demandAdjustment;

  return {
    finalPrice,
    demandAdjustment,
    demandApplied: true,
    bookingCount,
    percentageIncrease: Math.round((demandAdjustment / currentPrice) * 100),
  };
};

/**
 * Calculate final booking price (main function)
 * @param {Object} priceSlots - { morning, afternoon, evening }
 * @param {String} timeSlot - Time slot string
 * @param {Number} bookingCount - Number of existing bookings (for demand pricing)
 * @param {Object} options - Additional options
 * @returns {Object} - Complete pricing breakdown
 */
const calculateDynamicPrice = (
  priceSlots,
  timeSlot,
  bookingCount = 0,
  options = {
    enableDemandPricing: true,
    demandThreshold: 3,
    demandMultiplier: 50,
  }
) => {
  // Step 1: Get base price by category
  const basePriceInfo = calculateBasePrice(priceSlots, timeSlot);

  if (basePriceInfo.error) {
    return {
      success: false,
      message: basePriceInfo.error,
    };
  }

  // Step 2: Apply peak hour pricing
  const priceAfterPeak = applyPeakPricing(
    basePriceInfo.basePrice,
    basePriceInfo.isPeakTime,
    basePriceInfo.peakMultiplier
  );

  // Step 3: Apply demand-based pricing (optional)
  let finalPricing = {
    finalPrice: priceAfterPeak,
    demandAdjustment: 0,
    demandApplied: false,
  };

  if (options.enableDemandPricing) {
    finalPricing = applyDemandPricing(
      priceAfterPeak,
      bookingCount,
      {
        demandThreshold: options.demandThreshold,
        demandMultiplier: options.demandMultiplier,
      }
    );
  }

  // Return complete pricing breakdown
  return {
    success: true,
    pricing: {
      basePrice: basePriceInfo.basePrice,
      priceAfterPeakMultiplier: priceAfterPeak,
      peakMultiplier: basePriceInfo.peakMultiplier,
      isPeakTime: basePriceInfo.isPeakTime,
      finalPrice: finalPricing.finalPrice,
      demandAdjustment: finalPricing.demandAdjustment,
      demandApplied: finalPricing.demandApplied,
      percentageIncrease: finalPricing.percentageIncrease || 0,
    },
    details: {
      timeSlot,
      category: basePriceInfo.category,
      categoryLabel: basePriceInfo.label,
      bookingCount,
    },
    priceBreakdown: {
      step1_basePrice: basePriceInfo.basePrice,
      step2_afterPeakAdjustment: {
        priceAfterPeak,
        peakMultiplier: `${(basePriceInfo.peakMultiplier * 100).toFixed(0)}%`,
      },
      step3_afterDemandAdjustment: {
        finalPrice: finalPricing.finalPrice,
        demandAdjustment: finalPricing.demandAdjustment,
      },
    },
  };
};

/**
 * Get all time slots grouped by category
 * Useful for frontend to display available slots
 * @returns {Object} - Time slots grouped by category
 */
const getTimeSlotsByCategory = () => {
  return TIME_SLOT_CATEGORIES;
};

module.exports = {
  calculateDynamicPrice,
  calculateBasePrice,
  getTimeSlotCategory,
  applyPeakPricing,
  applyDemandPricing,
  getTimeSlotsByCategory,
  TIME_SLOT_CATEGORIES,
};
