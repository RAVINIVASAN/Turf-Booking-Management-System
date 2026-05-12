import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Phone, Mail } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './Button';
import { useToast } from '../context/ToastContext';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom turf marker icon (green)
const turfIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYgMEM4LjI3IDAgMiA2LjI3IDIgMTRjMCA2IDE2IDMwIDE2IDMwczE2LTI0IDE2LTMwYzAtNy43My02LjI3LTE0LTE0LTE0eiIgZmlsbD0iIzIyYzU1ZSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTQiIHI9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=',
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

const MapViewUpdater = ({ userLocation }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!userLocation) return;
    map.setView([userLocation.latitude, userLocation.longitude], map.getZoom(), { animate: true });
  }, [map, userLocation]);

  return null;
};

export const MapComponent = ({
  turfs = [],
  selectedTurfId = null,
  onTurfSelect = null,
  userLocation,
  locationMessage = '',
  availabilityByTurf = {},
  slotLoadingByTurf = {},
  selectedDate = '',
}) => {
  const { addToast } = useToast();

  const handleGetDirections = (lat, lng, turfName) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
    addToast(`Opening directions to ${turfName}...`, 'info');
  };

  if (!userLocation) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-300">
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={13}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      >
        <MapViewUpdater userLocation={userLocation} />

        {/* Map Tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User Location Marker */}
        <Marker
          position={[userLocation.latitude, userLocation.longitude]}
          icon={L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMzc3M2Y2Ii8+PC9zdmc+',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })}
        >
          <Popup>
            <div className="text-sm font-semibold">📍 Your Location</div>
          </Popup>
        </Marker>

        {/* Turf Markers */}
        {turfs && turfs.length > 0 && turfs.map((turf) => (
          <Marker
            key={turf._id}
            position={[turf.latitude, turf.longitude]}
            icon={turfIcon}
            eventHandlers={{
              click: () => onTurfSelect?.(turf._id),
            }}
            opacity={selectedTurfId === turf._id ? 1 : 0.7}
          >
            <Popup>
              <div className="w-64 p-3 space-y-2">
                {/* Turf Name */}
                <h3 className="font-bold text-lg text-gray-900">{turf.name}</h3>

                {/* Location */}
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>{turf.description || 'No description'}</span>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-blue-50 p-2 rounded text-center">
                    <p className="text-gray-600">Morning</p>
                    <p className="font-bold text-green-600">₹{turf.priceSlots?.morning}</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded text-center">
                    <p className="text-gray-600">Afternoon</p>
                    <p className="font-bold text-green-600">₹{turf.priceSlots?.afternoon}</p>
                  </div>
                  <div className="bg-purple-50 p-2 rounded text-center">
                    <p className="text-gray-600">Evening</p>
                    <p className="font-bold text-green-600">₹{turf.priceSlots?.evening}</p>
                  </div>
                </div>

                {/* Contact Info */}
                {(turf.phoneNumber || turf.email) && (
                  <div className="space-y-1 text-xs">
                    {turf.phoneNumber && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-3 h-3 text-green-600" />
                        <a href={`tel:${turf.phoneNumber}`} className="text-blue-600 hover:underline">
                          {turf.phoneNumber}
                        </a>
                      </div>
                    )}
                    {turf.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-3 h-3 text-green-600" />
                        <a href={`mailto:${turf.email}`} className="text-blue-600 hover:underline">
                          {turf.email}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleGetDirections(turf.latitude, turf.longitude, turf.name)}
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                </div>

                <div className="pt-2 border-t border-gray-200 text-xs text-gray-700">
                  {slotLoadingByTurf[`${turf._id}:${selectedDate}`] && <p>Loading availability...</p>}
                  {!slotLoadingByTurf[`${turf._id}:${selectedDate}`] && availabilityByTurf[`${turf._id}:${selectedDate}`] && (
                    <>
                      <p className="font-semibold mb-1">Available slots on {selectedDate}: {availabilityByTurf[`${turf._id}:${selectedDate}`].availableSlots?.length || 0}</p>
                      <p className="text-gray-600 line-clamp-2">
                        {(availabilityByTurf[`${turf._id}:${selectedDate}`].availableSlots || []).slice(0, 3).join(', ') || 'No slots available'}
                      </p>
                    </>
                  )}
                  {!slotLoadingByTurf[`${turf._id}:${selectedDate}`] && !availabilityByTurf[`${turf._id}:${selectedDate}`] && (
                    <p className="text-gray-600">Select this turf to load live slot availability.</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Info Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 border-t border-gray-200 px-4 py-2 text-xs text-gray-600">
        <p>
          📍 Showing {turfs?.length || 0} turfs • Click markers for details • {locationMessage || 'Use map controls to zoom'}
        </p>
      </div>
    </div>
  );
};
