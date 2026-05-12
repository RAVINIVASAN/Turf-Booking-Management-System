import React from 'react';
import { CheckCircle, Copy, Download, Share2, Calendar } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../context/ToastContext';

export const BookingSuccessModal = ({
  isOpen,
  booking,
  turf,
  onClose,
}) => {
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(booking._id || booking.id);
    addToast('Booking ID copied to clipboard!', 'success');
  };

  const handleShare = () => {
    const text = `🎉 I just booked ${turf.name} on ${new Date(booking.date).toLocaleDateString()} at ${booking.timeSlot}!
Book your turf now on TurfHub: https://turf-booking-management-system-wf3g.onrender.com`;

    if (navigator.share) {
      navigator.share({
        title: 'TurfHub Booking',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      addToast('Share text copied to clipboard!', 'success');
    }
  };

  const bookingDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-slideIn">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-green-100 mt-1">Your turf is reserved</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Booking Reference */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 mb-1">Booking Reference ID</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono font-bold text-lg text-gray-900 break-all">
                {booking._id?.slice(-8).toUpperCase() || 'TRF12345'}
              </p>
              <button
                onClick={handleCopyBookingId}
                className="p-2 hover:bg-blue-100 rounded transition"
                title="Copy booking ID"
              >
                <Copy className="w-4 h-4 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📋 Booking Details</h3>
              <div className="space-y-1 bg-gray-50 p-3 rounded">
                <div className="flex justify-between">
                  <span className="text-gray-600">Turf Name:</span>
                  <span className="font-semibold text-gray-900">{turf.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold text-gray-900">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Slot:</span>
                  <span className="font-semibold text-gray-900">{booking.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Players:</span>
                  <span className="font-semibold text-gray-900">{booking.totalPlayers}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600 font-semibold">Total Amount:</span>
                  <span className="font-bold text-green-600">₹{booking.totalAmount || booking.price}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">Payment Status: Paid</span>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs space-y-1">
            <p className="font-semibold text-amber-900">📌 Important Information</p>
            <ul className="text-amber-800 space-y-1 list-disc list-inside">
              <li>Save your booking reference ID</li>
              <li>Arrive 15 minutes early</li>
              <li>Bring your ID for verification</li>
              <li>Free cancellation until 24 hours before</li>
            </ul>
          </div>

          {/* Turf Contact */}
          {(turf.phoneNumber || turf.email) && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-xs space-y-1">
              <p className="font-semibold text-blue-900">📞 Turf Contact</p>
              {turf.phoneNumber && (
                <a
                  href={`tel:${turf.phoneNumber}`}
                  className="text-blue-600 hover:underline block"
                >
                  {turf.phoneNumber}
                </a>
              )}
              {turf.email && (
                <a
                  href={`mailto:${turf.email}`}
                  className="text-blue-600 hover:underline block"
                >
                  {turf.email}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 space-y-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Receipt
            </Button>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Continue Shopping
          </Button>
        </div>

        {/* Footer Message */}
        <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-600">
          <p>Confirmation email sent to your registered email address</p>
        </div>
      </div>
    </div>
  );
};
