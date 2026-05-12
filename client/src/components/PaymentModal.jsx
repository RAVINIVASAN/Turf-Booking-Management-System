import React, { useState } from 'react';
import { Clock, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../context/ToastContext';

export const PaymentModal = ({
  isOpen,
  turf,
  booking,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  // Calculate pricing
  const calculatePrice = () => {
    if (!turf || !booking.timeSlot) return 0;

    const hour = parseInt(booking.timeSlot.split('AM')[0] || booking.timeSlot.split('PM')[0]);
    let basePrice = 0;

    if (hour < 12) {
      basePrice = turf.priceSlots?.morning || 0;
    } else if (hour < 17) {
      basePrice = turf.priceSlots?.afternoon || 0;
    } else {
      basePrice = turf.priceSlots?.evening || 0;
    }

    return basePrice;
  };

  const basePrice = calculatePrice();
  const gst = Math.round(basePrice * 0.18); // 18% GST
  const totalPrice = basePrice + gst;

  // Determine peak hours
  const isPeakHour = () => {
    const hour = parseInt(booking.timeSlot.split('AM')[0] || booking.timeSlot.split('PM')[0]);
    return hour >= 17; // Evening is peak
  };

  const handleRazorpayPayment = async () => {
    try {
      setPaymentLoading(true);

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Razorpay options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_1DP5mmOlF5G0k7', // Test key
          amount: totalPrice * 100, // Amount in paise
          currency: 'INR',
          name: 'TurfHub',
          description: `Booking: ${turf.name} - ${booking.timeSlot}`,
          image: '/favicon.ico',
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999',
          },
          notes: {
            turfId: turf._id,
            turfName: turf.name,
            date: booking.date,
            timeSlot: booking.timeSlot,
            players: booking.totalPlayers,
          },
          handler: (response) => {
            addToast('Payment successful! Processing booking...', 'success');
            onPaymentSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
            setPaymentLoading(false);
          },
          modal: {
            ondismiss: () => {
              addToast('Payment cancelled', 'error');
              setPaymentLoading(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch {
      addToast('Failed to process payment', 'error');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-slideIn">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Confirm Booking</h2>
          <p className="text-gray-600 text-sm mt-1">Review and proceed to payment</p>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          <div>
            <h3 className="font-bold text-gray-900">{turf.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{turf.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(booking.date).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700">Time Slot:</span>
              <span className="font-semibold text-gray-900">{booking.timeSlot}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700">Players:</span>
              <span className="font-semibold text-gray-900">{booking.totalPlayers}</span>
            </div>

            {booking.notes && (
              <div>
                <span className="text-gray-700">Notes:</span>
                <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 text-sm mb-2">Price Breakdown</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Base Price:</span>
              <span className="text-gray-900">₹{basePrice}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-700">GST (18%):</span>
              <span className="text-gray-900">₹{gst}</span>
            </div>

            {isPeakHour() && (
              <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Peak Hour Charge
                </span>
                <span className="text-red-600 font-semibold">+₹100</span>
              </div>
            )}
          </div>

          <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total Amount:</span>
            <span className="text-2xl font-bold text-green-600">₹{totalPrice}</span>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
          <div className="flex gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Secure Payment</p>
              <p className="text-green-700 text-xs mt-1">
                Your payment is processed securely via Razorpay. You can pay using any UPI, Card, or Netbanking method.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Cancellation Policy</p>
              <p className="text-amber-700 text-xs mt-1">
                Free cancellation up to 24 hours before booking.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 gap-2"
            onClick={handleRazorpayPayment}
            loading={paymentLoading}
            disabled={paymentLoading}
          >
            💳 Pay ₹{totalPrice}
          </Button>
        </div>

        {/* Loading State */}
        {paymentLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Opening payment gateway...
          </div>
        )}
      </div>
    </div>
  );
};
