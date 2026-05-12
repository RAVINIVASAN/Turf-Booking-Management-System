import React, { useState, useEffect } from 'react';
import { Clock, Users, MessageSquare, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Button } from './Button';
import { PaymentModal } from './PaymentModal';
import { useToast } from '../context/ToastContext';
import { bookingAPI } from '../services/api';

const TIME_SLOTS = [
  '6AM-7AM', '7AM-8AM', '8AM-9AM', '9AM-10AM', '10AM-11AM', '11AM-12PM',
  '12PM-1PM', '1PM-2PM', '2PM-3PM', '3PM-4PM', '4PM-5PM', '5PM-6PM',
  '6PM-7PM', '7PM-8PM', '8PM-9PM', '9PM-10PM',
];

export const EnhancedBookingForm = ({ turf, onBookingComplete }) => {
  const [booking, setBooking] = useState({
    date: '',
    timeSlot: '',
    totalPlayers: 1,
    notes: '',
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    setBooking((prev) => ({
      ...prev,
      date: minDate,
    }));
  }, []);

  const handleDateChange = async (e) => {
    const selectedDate = e.target.value;
    setBooking({ ...booking, date: selectedDate, timeSlot: '' });

    // Fetch booked slots for selected date
    if (selectedDate) {
      try {
        const response = await bookingAPI.getTurfAvailability(turf._id);
        const bookings = response.data.data || response.data;
        const slotsForDate = bookings
          .filter((b) => {
            const bookingDate = new Date(b.date).toISOString().split('T')[0];
            return bookingDate === selectedDate && b.bookingStatus !== 'cancelled';
          })
          .map((b) => b.timeSlot);
        setBookedSlots(slotsForDate);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    }
  };

  const calculatePrice = () => {
    if (!turf || !booking.timeSlot) return 0;

    const hour = parseInt(booking.timeSlot.split('AM')[0] || booking.timeSlot.split('PM')[0]);
    let price = 0;

    if (hour < 12) {
      price = turf.priceSlots?.morning || 0;
    } else if (hour < 17) {
      price = turf.priceSlots?.afternoon || 0;
    } else {
      price = turf.priceSlots?.evening || 0;
    }

    return price;
  };

  const isPeakHour = () => {
    if (!booking.timeSlot) return false;
    const hour = parseInt(booking.timeSlot.split('AM')[0] || booking.timeSlot.split('PM')[0]);
    return hour >= 17; // Evening (5PM-10PM)
  };

  const getTimeCategory = () => {
    if (!booking.timeSlot) return null;
    const hour = parseInt(booking.timeSlot.split('AM')[0] || booking.timeSlot.split('PM')[0]);

    if (hour < 12) return { label: 'Morning', color: 'blue', emoji: '🌅' };
    if (hour < 17) return { label: 'Afternoon', color: 'orange', emoji: '☀️' };
    return { label: 'Evening (Peak)', color: 'red', emoji: '🔥' };
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);

      // Create booking with payment info
      const response = await bookingAPI.createBooking({
        turfId: turf._id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        totalPlayers: booking.totalPlayers,
        notes: booking.notes,
        paymentId: paymentData.paymentId,
        paymentStatus: 'paid',
      });

      addToast('🎉 Booking confirmed successfully!', 'success');
      setShowPaymentModal(false);
      onBookingComplete?.(response.data);
    } catch (error) {
      addToast(error.response?.data?.message || 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const basePrice = calculatePrice();
  const gst = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gst;
  const timeCategory = getTimeCategory();

  const canBook = booking.date && booking.timeSlot && !bookedSlots.includes(booking.timeSlot);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20 space-y-5">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-600" />
          Book This Turf
        </h2>

        {/* Form */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Select Date
            </label>
            <input
              type="date"
              value={booking.date}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">Select a future date</p>
          </div>

          {/* Time Slot */}
          {booking.date && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⏰ Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = booking.timeSlot === slot;

                  return (
                    <button
                      key={slot}
                      onClick={() => !isBooked && setBooking({ ...booking, timeSlot: slot })}
                      disabled={isBooked}
                      className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                        isSelected
                          ? 'bg-green-600 text-white ring-2 ring-green-300'
                          : isBooked
                          ? 'bg-red-100 text-red-700 cursor-not-allowed opacity-50'
                          : 'bg-gray-100 text-gray-800 hover:bg-green-50 hover:border-green-300 border-2 border-transparent'
                      }`}
                    >
                      {slot}
                      {isBooked && <span className="block text-xs mt-0.5">Booked</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {bookedSlots.length} slots booked. Click to select.
              </p>
            </div>
          )}

          {/* Players */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Total Players
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setBooking({
                    ...booking,
                    totalPlayers: Math.max(1, booking.totalPlayers - 1),
                  })
                }
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={booking.totalPlayers}
                onChange={(e) =>
                  setBooking({ ...booking, totalPlayers: parseInt(e.target.value) || 1 })
                }
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-center font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <button
                onClick={() =>
                  setBooking({
                    ...booking,
                    totalPlayers: Math.min(50, booking.totalPlayers + 1),
                  })
                }
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Special Requests (Optional)
            </label>
            <textarea
              value={booking.notes}
              onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
              placeholder="E.g., Need equipment rental, food, etc."
              rows="3"
              maxLength="200"
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {booking.notes.length}/200 characters
            </p>
          </div>
        </div>

        {/* Time Category Badge */}
        {timeCategory && (
          <div className={`bg-${timeCategory.color}-50 border-2 border-${timeCategory.color}-200 p-3 rounded-lg flex items-center gap-2`}>
            <span className="text-2xl">{timeCategory.emoji}</span>
            <div>
              <p className={`font-semibold text-${timeCategory.color}-900`}>
                {timeCategory.label}
              </p>
              {isPeakHour() && (
                <p className={`text-sm text-${timeCategory.color}-700 flex items-center gap-1`}>
                  <Zap className="w-3 h-3" />
                  Peak hour surcharge may apply
                </p>
              )}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 p-4 rounded-lg space-y-2">
          <h3 className="font-bold text-gray-900 mb-3">💰 Price Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Base Price:</span>
              <span className="font-semibold text-gray-900">₹{basePrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700">GST (18%):</span>
              <span className="font-semibold text-gray-900">₹{gst}</span>
            </div>

            <div className="border-t-2 border-green-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total Amount:</span>
              <span className="text-3xl font-bold text-green-600">₹{totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Error States */}
        {booking.date && booking.timeSlot && bookedSlots.includes(booking.timeSlot) && (
          <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">This slot is already booked. Please select another.</p>
          </div>
        )}

        {booking.date && !booking.timeSlot && (
          <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-lg flex gap-2">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Please select a time slot to continue.</p>
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={() => setShowPaymentModal(true)}
          disabled={!canBook || loading}
          loading={loading}
          className="w-full h-12 text-lg gap-2"
          size="lg"
        >
          💳 Proceed to Payment
        </Button>

        {/* Info */}
        <div className="flex gap-2 text-xs text-gray-600">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p>Secure payment powered by Razorpay. Your data is protected.</p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        turf={turf}
        booking={booking}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        loading={loading}
      />
    </>
  );
};
