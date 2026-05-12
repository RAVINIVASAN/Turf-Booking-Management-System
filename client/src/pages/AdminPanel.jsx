import { useState, useEffect } from 'react';
import { BarChart3, Users, Zap, DollarSign, BookOpen } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AdminTurfManager } from '../components/AdminTurfManager';
import { AdminBookingsManager } from '../components/AdminBookingsManager';
import { AdminUsersManager } from '../components/AdminUsersManager';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { addToast } = useToast();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load statistics';
      addToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            🎛️ Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Manage turfs, bookings, and users</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-2 md:gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('turfs')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'turfs'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚽ Turfs
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'bookings'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Bookings
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Users
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Users Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-semibold mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                    <p className="text-xs text-blue-600 mt-2">
                      {stats.users.admins} admins · {stats.users.vendors} vendors
                    </p>
                  </div>
                  <Users size={40} className="text-blue-600 opacity-50" />
                </div>
              </div>

              {/* Turfs Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-6 border-l-4 border-green-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-semibold mb-1">Total Turfs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.turfs.total}</p>
                    <p className="text-xs text-green-600 mt-2">
                      {stats.turfs.active} active · {stats.turfs.inactive} inactive
                    </p>
                  </div>
                  <Zap size={40} className="text-green-600 opacity-50" />
                </div>
              </div>

              {/* Bookings Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border-l-4 border-purple-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-semibold mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.bookings.total}</p>
                    <p className="text-xs text-purple-600 mt-2">
                      {stats.bookings.confirmed} confirmed · {stats.bookings.completed} completed
                    </p>
                  </div>
                  <BookOpen size={40} className="text-purple-600 opacity-50" />
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 border-l-4 border-orange-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-semibold mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{(stats.revenue.total / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-orange-600 mt-2">
                      Avg: ₹{stats.revenue.average.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <DollarSign size={40} className="text-orange-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Detail Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Booking Status Breakdown */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Booking Status Map</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confirmed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              stats.bookings.total > 0
                                ? (stats.bookings.confirmed / stats.bookings.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.bookings.confirmed}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Completed</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${
                              stats.bookings.total > 0
                                ? (stats.bookings.completed / stats.bookings.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.bookings.completed}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cancelled</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              stats.bookings.total > 0
                                ? (stats.bookings.cancelled / stats.bookings.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.bookings.cancelled}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Breakdown */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">👥 User Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Regular Users</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? (stats.users.regularUsers / stats.users.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.users.regularUsers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Vendors</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? (stats.users.vendors / stats.users.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.users.vendors}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Admins</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              stats.users.total > 0
                                ? (stats.users.admins / stats.users.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stats.users.admins}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Turfs Tab */}
        {activeTab === 'turfs' && <AdminTurfManager />}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && <AdminBookingsManager />}

        {/* Users Tab */}
        {activeTab === 'users' && <AdminUsersManager />}
      </div>
    </div>
  );
}

export default AdminPanel;
