import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../services/api';

export function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [cancelingId, setCancelingId] = useState(null);
  const { token } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, filterStatus, sortBy]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/bookings/my');
      setBookings(response.data.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load bookings';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...bookings];

    // Apply filter
    if (filterStatus !== 'all') {
      result = result.filter(
        (booking) =>
          booking.bookingStatus === filterStatus ||
          booking.paymentStatus === filterStatus
      );
    }

    // Apply sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    }

    setFilteredBookings(result);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelingId(bookingId);
      await api.put(`/bookings/cancel/${bookingId}`);
      addToast('Booking cancelled successfully', 'success');
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b
        )
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel booking';
      addToast(errorMessage, 'error');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-4">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={Calendar}
            title="Unable to load bookings"
            description={error}
            actionLabel="Try Again"
            onAction={fetchBookings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Booking History
          </h1>
          <p className="text-gray-600">View and manage all your turf bookings</p>
        </div>

        {bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="You haven't booked any turfs yet. Start exploring and book your first turf today!"
            actionLabel="Browse Turfs"
            onAction={() => (window.location.href = '/map')}
          />
        ) : (
          <>
            {/* Filters & Sorting */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 text-sm text-gray-600">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>

            {/* Bookings Grid */}
            {filteredBookings.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {booking.turfId?.name || 'Turf'}
                      </h3>
                      <div className="flex gap-2">
                        <Badge status={booking.bookingStatus} />
                        <Badge status={booking.paymentStatus} />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6 border-t border-b border-gray-200 py-4">
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin size={18} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm">
                          {booking.turfId?.location || 'Location'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar size={18} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm">
                          {new Date(booking.date).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock size={18} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm">{booking.timeSlot}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-700">
                        <DollarSign size={18} className="text-teal-600 flex-shrink-0" />
                        <span className="text-sm font-semibold">
                          ₹{booking.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Notes:</span> {booking.notes}
                        </p>
                      </div>
                    )}

                    {/* Players Count */}
                    <div className="mb-4 text-sm text-gray-600">
                      <span className="font-semibold">{booking.totalPlayers}</span> player(s)
                    </div>

                    {/* Action Button */}
                    {booking.bookingStatus !== 'cancelled' &&
                      booking.bookingStatus !== 'completed' && (
                        <Button
                          onClick={() => handleCancelBooking(booking._id)}
                          variant="danger"
                          size="sm"
                          loading={cancelingId === booking._id}
                          className="w-full"
                        >
                          <Trash2 size={16} />
                          Cancel Booking
                        </Button>
                      )}

                    {booking.bookingStatus === 'cancelled' && (
                      <div className="text-center py-2 text-sm text-red-600 font-semibold">
                        Booking Cancelled
                      </div>
                    )}

                    {booking.bookingStatus === 'completed' && (
                      <div className="text-center py-2 text-sm text-green-600 font-semibold">
                        Completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings match your filters"
                description="Try adjusting your filter criteria to find bookings"
                actionLabel="Reset Filters"
                onAction={() => {
                  setFilterStatus('all');
                  setSortBy('newest');
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BookingHistoryPage;
