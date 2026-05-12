import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, ArrowLeft, Star, Zap } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { EnhancedBookingForm } from '../components/EnhancedBookingForm';
import { BookingSuccessModal } from '../components/BookingSuccessModal';
import { useToast } from '../context/ToastContext';
import { turfAPI } from '../services/api';

export const TurfDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [turf, setTurf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchTurfDetails();
  }, [id]);

  const fetchTurfDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await turfAPI.getTurfById(id);
      setTurf(response.data.data || response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load turf details';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!turf || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error ? 'Error loading turf' : 'Turf not found'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The turf you are looking for does not exist.'}
          </p>
          <div className="flex gap-3">
            <Button onClick={fetchTurfDetails} variant={error ? 'primary' : 'secondary'} className="flex-1">
              {error ? 'Try Again' : 'Go Back'}
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="flex-1">
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleBookingComplete = (booking) => {
    setBookingSuccess(booking);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/bookings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6 transition font-medium"
        >
          <ArrowLeft size={18} />
          Back to Turfs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <div className="bg-gradient-to-br from-teal-400 via-emerald-400 to-teal-600 h-80 flex items-center justify-center text-white">
                <span className="text-9xl animate-bounce">⚽</span>
              </div>
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{(turf.rating || 4.5).toFixed(1)}</span>
              </div>
            </div>

            {/* Turf Info Card */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-8 space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                  {turf.name}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {turf.description || 'Premium turf facility for your sports needs'}
                </p>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <MapPin size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
                    <p className="text-gray-900 font-medium">{turf.location}</p>
                    <p className="text-xs text-gray-500 mt-1">Lat: {turf.latitude}, Lon: {turf.longitude}</p>
                  </div>
                </div>

                {turf.phoneNumber && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Phone size={24} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Contact</p>
                      <a
                        href={`tel:${turf.phoneNumber}`}
                        className="text-teal-600 hover:text-teal-700 font-semibold text-lg transition"
                      >
                        {turf.phoneNumber}
                      </a>
                    </div>
                  </div>
                )}

                {turf.email && (
                  <div className="flex items-start gap-4 md:col-span-2">
                    <div className="p-3 bg-teal-100 rounded-lg">
                      <Mail size={24} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${turf.email}`}
                        className="text-teal-600 hover:text-teal-700 font-semibold transition"
                      >
                        {turf.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {turf.amenities && turf.amenities.length > 0 && (
                <div className="pt-6 border-t-2 border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    🎁 Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {turf.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-3 bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 text-sm font-semibold rounded-xl border border-teal-200 text-center hover:shadow-md transition"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Info */}
              <div className="pt-6 border-t-2 border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-teal-600" /> Dynamic Pricing
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-6 rounded-xl text-center hover:shadow-md transition">
                    <p className="text-sm text-blue-700 font-bold mb-2">🌅 Morning</p>
                    <p className="text-3xl font-bold text-blue-600">₹{(turf.priceSlots?.morning || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-blue-600 mt-2">6AM - 12PM</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-6 rounded-xl text-center hover:shadow-md transition">
                    <p className="text-sm text-orange-700 font-bold mb-2">☀️ Afternoon</p>
                    <p className="text-3xl font-bold text-orange-600">₹{(turf.priceSlots?.afternoon || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-orange-600 mt-2">12PM - 5PM</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-purple-100 border-2 border-red-300 p-6 rounded-xl text-center hover:shadow-md transition transform hover:scale-105">
                    <p className="text-sm text-red-700 font-bold mb-2">🔥 Evening (Peak)</p>
                    <p className="text-3xl font-bold text-red-600">₹{(turf.priceSlots?.evening || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-red-600 mt-2">5PM - 10PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar (Right 1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EnhancedBookingForm
                turf={turf}
                onBookingComplete={handleBookingComplete}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        booking={bookingSuccess}
        turf={turf}
        onClose={handleCloseSuccess}
      />
    </div>
  );
};

export default TurfDetailsPage;
