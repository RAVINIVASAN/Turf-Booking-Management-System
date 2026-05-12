import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, MapIcon } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { turfAPI } from '../services/api';

export const DashboardPage = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await turfAPI.getAllTurfs();
      setTurfs(response.data.data || response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load turfs';
      setError(errorMsg);
      addToast(errorMsg, 'error');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            🌿 Find Your Perfect Turf
          </h1>
          <p className="text-lg text-gray-600">
            Browse and book premium turfs near you for your next game
          </p>
        </div>

        {/* Turfs Grid or Empty State */}
        {turfs && turfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turfs.map((turf) => (
              <Link key={turf._id} to={`/turf/${turf._id}`} className="group">
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 hover:border-teal-200">
                  {/* Image Placeholder */}
                  <div className="w-full h-48 bg-gradient-to-br from-teal-400 via-green-400 to-teal-600 flex items-center justify-center text-white overflow-hidden">
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      ⚽
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {turf.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-start gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-600" />
                      <span className="text-sm line-clamp-2">
                        {turf.location || 'Location not specified'}
                      </span>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-medium mb-1">Morning</p>
                        <p className="font-bold text-teal-600">
                          ₹{(turf.priceSlots?.morning || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-center border-l border-r border-gray-300">
                        <p className="text-xs text-gray-600 font-medium mb-1">Afternoon</p>
                        <p className="font-bold text-orange-600">
                          ₹{(turf.priceSlots?.afternoon || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 font-medium mb-1">Evening</p>
                        <p className="font-bold text-purple-600">
                          ₹{(turf.priceSlots?.evening || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Rating & Button */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < Math.floor(turf.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {(turf.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <Button size="sm" className="group-hover:gap-2">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MapIcon}
            title="No turfs available right now"
            description={
              error
                ? error
                : 'We couldn\'t find any available turfs. Check back soon or try exploring the map!'
            }
            actionLabel={error ? 'Try Again' : 'Explore Map'}
            onAction={error ? fetchTurfs : () => (window.location.href = '/map')}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
