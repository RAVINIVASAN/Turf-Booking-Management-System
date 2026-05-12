import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Badge } from './Badge';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export function AdminBookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', paymentStatus: '' });
  const [page, setPage] = useState(1);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [page, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (filters.status) params.append('status', filters.status);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);

      const response = await api.get(`/admin/bookings?${params.toString()}`);
      setBookings(response.data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load bookings';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading bookings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => { setFilters({ ...filters, paymentStatus: e.target.value }); setPage(1); }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {bookings.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Turf</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Date & Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.userId.name}</p>
                        <p className="text-xs text-gray-600">{booking.userId.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{booking.turfId.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.date).toLocaleDateString('en-IN')}
                      <br />
                      {booking.timeSlot}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-teal-600">₹{booking.price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge status={booking.bookingStatus} />
                        <Badge status={booking.paymentStatus} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}
    </div>
  );
}
