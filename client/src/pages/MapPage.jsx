import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Map as MapIcon, List, MapPin, Clock, Navigation, X } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { bookingAPI, turfAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const DEFAULT_LOCATION = { latitude: 13.0827, longitude: 80.2707 }; // Chennai fallback
const PAGE_SIZE = 20;
const TOMTOM_API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || '';

const toRadians = (degrees) => degrees * (Math.PI / 180);

const calculateDistanceKm = (originLat, originLon, destinationLat, destinationLon) => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destinationLat - originLat);
  const deltaLon = toRadians(destinationLon - originLon);
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(originLat)) *
      Math.cos(toRadians(destinationLat)) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return parseFloat((earthRadiusKm * c).toFixed(2));
};

// TomTom Geolocation API
const getTomTomLocation = async () => {
  try {
    if (!TOMTOM_API_KEY || TOMTOM_API_KEY === 'YOUR_TOMTOM_API_KEY_HERE') {
      return null;
    }

    const response = await fetch(
      `https://api.tomtom.com/search/2/reverseGeocode/-34.4028,150.8928.json?key=${TOMTOM_API_KEY}`,
      { timeout: 5000 }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('TomTom API error, falling back to browser geolocation:', error);
    return null;
  }
};

export const MapPage = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedTurfId, setSelectedTurfId] = useState(null);
  const [availabilityByTurf, setAvailabilityByTurf] = useState({});
  const [slotLoadingByTurf, setSlotLoadingByTurf] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState('Detecting your location for nearby turfs...');
  const [permissionState, setPermissionState] = useState('prompt');
  const [viewMode, setViewMode] = useState('split'); // 'split', 'map', 'list'
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'name'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available'
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreTurfs, setHasMoreTurfs] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const getAvailabilityKey = (turfId, date) => `${turfId}:${date}`;

  const displayTurfs = useMemo(() => {
    const withDistance = turfs.map((turf) => {
      if (turf.distance !== undefined && turf.distance !== null) {
        return turf;
      }

      if (!userLocation) {
        return turf;
      }

      return {
        ...turf,
        distance: calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          turf.latitude,
          turf.longitude
        ),
      };
    });

    const filtered = withDistance.filter((turf) => {
      if (availabilityFilter !== 'available') {
        return true;
      }

      const availability = availabilityByTurf[getAvailabilityKey(turf._id, selectedDate)];
      return (availability?.availableSlots || []).length > 0;
    });

    if (sortBy === 'name') {
      return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...filtered].sort((a, b) => {
      const distanceA = a.distance ?? Number.MAX_SAFE_INTEGER;
      const distanceB = b.distance ?? Number.MAX_SAFE_INTEGER;
      return distanceA - distanceB;
    });
  }, [availabilityByTurf, availabilityFilter, selectedDate, sortBy, turfs, userLocation]);

  const selectedTurf = displayTurfs.find((turf) => turf._id === selectedTurfId) || null;
  const selectedAvailabilityKey = selectedTurfId ? `${selectedTurfId}:${selectedDate}` : null;
  const selectedAvailability = selectedAvailabilityKey ? availabilityByTurf[selectedAvailabilityKey] : null;

  const fetchAllTurfsFallback = useCallback(async (message) => {
    try {
      setLoading(true);
      setCurrentPage(1);
      setHasMoreTurfs(false);
      const response = await turfAPI.getAllTurfs();
      const allTurfs = response.data.data || response.data;
      setTurfs(allTurfs);
      setLocationMessage(message || 'Showing all turfs. Enable location for nearby recommendations.');
    } catch {
      addToast('Failed to load turfs', 'error');
      setTurfs([]);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchNearbyTurfs = useCallback(async (latitude, longitude, date, options = {}) => {
    const { page = 1, append = false } = options;

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await turfAPI.getNearbyTurfsWithAvailability(latitude, longitude, date, 15, page, PAGE_SIZE);
      const nearbyTurfs = response.data?.data || [];
      const pagination = response.data?.pagination;

      setCurrentPage(pagination?.page || page);
      setHasMoreTurfs(Boolean(pagination?.hasMore));

      if (nearbyTurfs.length === 0) {
        if (append) {
          setHasMoreTurfs(false);
          return;
        }

        await fetchAllTurfsFallback('No nearby turfs found for your location. Showing all turfs instead.');
        return;
      }

      const availabilityEntries = {};
      nearbyTurfs.forEach((turf) => {
        if (turf.availability) {
          availabilityEntries[getAvailabilityKey(turf._id, date)] = {
            ...turf.availability,
            turfId: turf._id,
          };
        }
      });

      if (Object.keys(availabilityEntries).length > 0) {
        setAvailabilityByTurf((prev) => ({
          ...prev,
          ...availabilityEntries,
        }));
      }

      if (append) {
        setTurfs((prev) => {
          const existingIds = new Set(prev.map((turf) => turf._id));
          const nextItems = nearbyTurfs.filter((turf) => !existingIds.has(turf._id));
          return [...prev, ...nextItems];
        });
      } else {
        setTurfs(nearbyTurfs);
      }

      setLocationMessage(`Showing ${nearbyTurfs.length} nearby turfs based on your location.`);
    } catch {
      if (append) {
        addToast('Unable to load more turfs right now', 'error');
      } else {
        await fetchAllTurfsFallback('Unable to fetch nearby turfs. Showing all turfs instead.');
      }
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [addToast, fetchAllTurfsFallback]);

  const requestUserLocation = useCallback(() => {
    setLocationLoading(true);

    // Try browser geolocation first (most reliable)
    if (navigator.geolocation) {
      setLocationMessage('📍 Detecting your location using GPS...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationMessage('✓ Location enabled via GPS. Loading nearby turfs...');
          setLocationLoading(false);
        },
        async (error) => {
          // Fallback to default location if geolocation fails
          console.warn('Geolocation error:', error);
          setUserLocation(DEFAULT_LOCATION);
          setLocationMessage('📍 Using default location (Chennai). Click "Enable Location" to use your actual location.');
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000,
        }
      );
    } else {
      // No geolocation support
      setLocationMessage('Geolocation is not supported in this browser. Using default location (Chennai).');
      setUserLocation(DEFAULT_LOCATION);
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    let permissionRef;

    const setupGeolocation = async () => {
      try {
        // Check permissions API support
        if (navigator.permissions && navigator.geolocation) {
          permissionRef = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(permissionRef.state);

          if (permissionRef.state === 'granted') {
            setLocationMessage('✓ Location permission granted. Detecting your precise location...');
            requestUserLocation();
          } else if (permissionRef.state === 'prompt') {
            setLocationMessage('📍 Click "Enable Location" to show nearby turfs based on your exact location.');
            setUserLocation(DEFAULT_LOCATION);
          } else {
            setLocationMessage('⚠️ Location access blocked. Showing default city view (Chennai).');
            setUserLocation(DEFAULT_LOCATION);
          }

          permissionRef.onchange = () => {
            setPermissionState(permissionRef.state);
            if (permissionRef.state === 'granted') {
              setLocationMessage('✓ Location permission enabled. Refreshing nearby turfs...');
              requestUserLocation();
            } else if (permissionRef.state === 'denied') {
              setUserLocation(DEFAULT_LOCATION);
              setLocationMessage('⚠️ Location permission blocked. Showing default city view.');
            }
          };
        } else {
          // No permissions API, just request location
          requestUserLocation();
        }
      } catch (error) {
        console.warn('Permissions API error:', error);
        requestUserLocation();
      }
    };

    setupGeolocation();

    return () => {
      if (permissionRef) {
        permissionRef.onchange = null;
      }
    };
  }, [requestUserLocation]);

  const loadAvailabilityForTurf = useCallback(async (turfId, date) => {
    const availabilityKey = getAvailabilityKey(turfId, date);

    if (availabilityByTurf[availabilityKey]) {
      return;
    }

    try {
      setSlotLoadingByTurf((prev) => ({ ...prev, [availabilityKey]: true }));
      const response = await bookingAPI.getTurfAvailability(turfId, date);
      const data = response.data?.data || {};
      setAvailabilityByTurf((prev) => ({
        ...prev,
        [availabilityKey]: data,
      }));
    } catch {
      addToast('Could not load slot availability for selected turf', 'error');
    } finally {
      setSlotLoadingByTurf((prev) => ({ ...prev, [availabilityKey]: false }));
    }
  }, [addToast, availabilityByTurf]);

  const handleTurfSelect = async (turfId) => {
    setSelectedTurfId(turfId);
    setShowMobileSheet(true);
  };

  const handleCloseMobileSheet = () => {
    setShowMobileSheet(false);
  };

  useEffect(() => {
    if (!selectedTurfId) {
      return;
    }

    loadAvailabilityForTurf(selectedTurfId, selectedDate);
  }, [loadAvailabilityForTurf, selectedDate, selectedTurfId]);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    fetchNearbyTurfs(userLocation.latitude, userLocation.longitude, selectedDate, { page: 1 });
  }, [fetchNearbyTurfs, selectedDate, userLocation]);

  const handleLoadMoreTurfs = async () => {
    if (!userLocation || loadingMore || !hasMoreTurfs) {
      return;
    }

    await fetchNearbyTurfs(userLocation.latitude, userLocation.longitude, selectedDate, {
      page: currentPage + 1,
      append: true,
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const renderSelectedTurfPanel = () => {
    if (!selectedTurf) {
      return (
        <div className="mb-6 rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-4 text-sm text-gray-600">
          Tap a turf marker or card to view its live availability.
        </div>
      );
    }

    return (
      <section className="mb-6 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedTurf.name}</h2>
              {selectedTurf.distance !== undefined && selectedTurf.distance !== null && (
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  {selectedTurf.distance} km away
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-teal-600" />
                {selectedTurf.location || 'Location unavailable'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-teal-600" />
                Slots for {selectedDate}
              </span>
            </div>

            <p className="max-w-2xl text-sm text-gray-600">
              {selectedTurf.description || 'Premium turf facility with live booking availability.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
            <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
              Select date
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                aria-label="Select date for turf availability"
              />
            </label>

            <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/turf/${selectedTurf._id}`)}>
              View Details
            </Button>
            <Button size="sm" onClick={() => navigate(`/turf/${selectedTurf._id}`)}>
              <Navigation className="h-4 w-4" />
              Book Now
            </Button>
          </div>
          </div>
        </div>

        <div className="border-t border-teal-100 bg-teal-50/60 p-5">
          {slotLoadingByTurf[selectedAvailabilityKey] ? (
            <p className="text-sm font-medium text-teal-900">Loading live availability...</p>
          ) : selectedAvailability ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-teal-900">
                Available slots: {selectedAvailability.availableSlots?.length || 0}
              </p>
              <div className="flex flex-wrap gap-2">
                {(selectedAvailability.availableSlots || []).length > 0 ? (
                  selectedAvailability.availableSlots.map((slot) => (
                    <span
                      key={slot}
                      className="rounded-full border border-teal-200 bg-white px-3 py-1 text-xs font-semibold text-teal-700"
                    >
                      {slot}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-teal-900">No slots available for the selected date.</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-teal-900">
              Select this turf to load live slot availability for the chosen date.
            </p>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Turfs Near You</h1>
          <p className="text-gray-600">View nearby turfs on the map or browse the list below</p>
        </div>

        {/* Location UX */}
        <div
          role="status"
          aria-live="polite"
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <p className="text-sm text-blue-900">{locationMessage}</p>
          {permissionState !== 'granted' && (
            <Button
              size="sm"
              onClick={requestUserLocation}
              disabled={locationLoading}
              aria-label="Enable location to find nearby turfs"
            >
              {locationLoading ? 'Getting Location...' : 'Enable Location'}
            </Button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={viewMode === 'split' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('split')}
            aria-label="Switch to split view"
          >
            Split View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="gap-2"
            aria-label="Switch to map-only view"
          >
            <MapIcon className="w-4 h-4" />
            Map Only
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
            aria-label="Switch to list-only view"
          >
            <List className="w-4 h-4" />
            List Only
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Sort
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              aria-label="Sort turfs"
            >
              <option value="distance">Distance</option>
              <option value="name">Name</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            Filter
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              aria-label="Filter turfs"
            >
              <option value="all">All turfs</option>
              <option value="available">Available on selected date</option>
            </select>
          </label>
        </div>

        {renderSelectedTurfPanel()}

        {/* Main Content */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map (left) */}
            <div className="lg:col-span-2 h-96 lg:h-screen lg:sticky lg:top-20">
              <MapComponent
                turfs={displayTurfs}
                selectedTurfId={selectedTurfId}
                onTurfSelect={handleTurfSelect}
                userLocation={userLocation || DEFAULT_LOCATION}
                locationMessage={locationMessage}
                availabilityByTurf={availabilityByTurf}
                slotLoadingByTurf={slotLoadingByTurf}
                selectedDate={selectedDate}
              />
            </div>

            {/* List (right) */}
            <div className="space-y-4 max-h-96 lg:max-h-screen overflow-y-auto">
              <h2 className="text-lg font-bold text-gray-900 sticky top-0 bg-gray-50 py-2">
                Available Turfs ({displayTurfs.length})
              </h2>
              {displayTurfs.map((turf) => (
                <div
                  key={turf._id}
                  onClick={() => handleTurfSelect(turf._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleTurfSelect(turf._id);
                    }
                  }}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTurfId === turf._id
                      ? 'bg-green-50 border-2 border-green-600 shadow-md'
                      : 'bg-white border border-gray-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-gray-900 mb-1">{turf.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{turf.description}</p>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div className="bg-blue-50 p-1.5 rounded text-center">
                      <p className="text-gray-500">Morning</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.morning}</p>
                    </div>
                    <div className="bg-orange-50 p-1.5 rounded text-center">
                      <p className="text-gray-500">Afternoon</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.afternoon}</p>
                    </div>
                    <div className="bg-purple-50 p-1.5 rounded text-center">
                      <p className="text-gray-500">Evening</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.evening}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/turf/${turf._id}`)}
                  >
                    Book Now
                  </Button>

                  {selectedTurfId === turf._id && (
                    <div className="mt-3 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-2">
                      {slotLoadingByTurf[getAvailabilityKey(turf._id, selectedDate)] && <p>Loading availability...</p>}
                      {!slotLoadingByTurf[getAvailabilityKey(turf._id, selectedDate)] && availabilityByTurf[getAvailabilityKey(turf._id, selectedDate)] && (
                        <p>
                          Available Slots: <span className="font-semibold">{availabilityByTurf[getAvailabilityKey(turf._id, selectedDate)].availableSlots?.length || 0}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {hasMoreTurfs && (
                <Button
                  variant="outline"
                  onClick={handleLoadMoreTurfs}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? 'Loading More...' : 'Load More Turfs'}
                </Button>
              )}
            </div>
          </div>
        )}

        {viewMode === 'map' && (
          <div className="h-screen rounded-lg overflow-hidden shadow-lg">
            <MapComponent
              turfs={displayTurfs}
              selectedTurfId={selectedTurfId}
              onTurfSelect={handleTurfSelect}
              userLocation={userLocation || DEFAULT_LOCATION}
              locationMessage={locationMessage}
              availabilityByTurf={availabilityByTurf}
              slotLoadingByTurf={slotLoadingByTurf}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {selectedTurf && showMobileSheet && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-gray-200 bg-white shadow-2xl">
            <div className="mx-auto w-14 py-2">
              <div className="h-1.5 rounded-full bg-gray-300" />
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-4 pb-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedTurf.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedTurf.distance !== undefined && selectedTurf.distance !== null
                      ? `${selectedTurf.distance} km away`
                      : selectedTurf.location || 'Location unavailable'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseMobileSheet}
                  aria-label="Close selected turf panel"
                  className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="mb-3 flex flex-col gap-1 text-sm font-medium text-gray-700">
                Select date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  aria-label="Select date for turf availability on mobile panel"
                />
              </label>

              <div className="rounded-xl bg-teal-50 p-3 text-sm">
                {slotLoadingByTurf[selectedAvailabilityKey] ? (
                  <p className="font-medium text-teal-900">Loading live availability...</p>
                ) : selectedAvailability ? (
                  <>
                    <p className="mb-2 font-semibold text-teal-900">
                      Available slots: {selectedAvailability.availableSlots?.length || 0}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedAvailability.availableSlots || []).slice(0, 8).map((slot) => (
                        <span
                          key={slot}
                          className="rounded-full border border-teal-200 bg-white px-2.5 py-1 text-xs font-semibold text-teal-700"
                        >
                          {slot}
                        </span>
                      ))}
                      {(selectedAvailability.availableSlots || []).length === 0 && (
                        <span className="text-teal-900">No slots available for this date.</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-teal-900">Select turf to load live slot availability.</p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => navigate(`/turf/${selectedTurf._id}`)}>
                  View Details
                </Button>
                <Button onClick={() => navigate(`/turf/${selectedTurf._id}`)}>
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTurfs.map((turf) => (
              <div
                key={turf._id}
                role="button"
                tabIndex={0}
                onClick={() => handleTurfSelect(turf._id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleTurfSelect(turf._id);
                  }
                }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Image */}
                <div className="w-full h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                  <span className="text-3xl">⚽</span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{turf.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{turf.description}</p>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-blue-50 p-2 rounded text-center text-xs">
                      <p className="text-gray-600">Morning</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.morning}</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded text-center text-xs">
                      <p className="text-gray-600">Afternoon</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.afternoon}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center text-xs">
                      <p className="text-gray-600">Evening</p>
                      <p className="font-bold text-green-600">₹{turf.priceSlots?.evening}</p>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full"
                    onClick={() => navigate(`/turf/${turf._id}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && hasMoreTurfs && (
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={handleLoadMoreTurfs}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading More...' : 'Load More Turfs'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
