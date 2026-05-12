# Geolocation Turf Discovery - React Implementation Plan

## 1) Concise User Flow

1. User logs in and lands on the map page.
2. App checks geolocation permission state (granted, prompt, denied).
3. If granted or prompt:
   - Request current position.
   - Show loading state while fetching location and nearby turf data.
   - Render nearby turfs on map and list.
4. If denied/unavailable:
   - Use a default city coordinate fallback.
   - Show a clear message explaining fallback behavior.
   - Fetch turfs near default city or all turfs if nearby endpoint fails.
5. User selects a turf marker/card:
   - Fetch availability for selected date.
   - Show available slots and booking CTA.
6. If permission changes at runtime:
   - Re-fetch user location and nearby turfs automatically.

## 2) Frontend Requirements

### Map Integration

- Preferred: Leaflet + react-leaflet (already in this project).
- Base map: OpenStreetMap tile layer.
- Render:
  - User location marker.
  - Turf markers.
  - Marker popup summary.

### Geolocation Handling

- Use navigator.geolocation.getCurrentPosition with timeout, high accuracy, and cache settings.
- Use navigator.permissions.query({ name: 'geolocation' }) when available to react to permission changes.
- Implement explicit "Enable Location" retry button.

### Fallback Behavior

- If location is denied/unavailable/timeouts:
  - Use default city lat/lng.
  - Display user-facing fallback message.
  - Fetch turfs using nearby endpoint with default city coordinates.

## 3) Data Requirements

### Turf API Shape

Nearby response:

~~~json
{
  "success": true,
  "count": 3,
  "userLocation": { "latitude": 12.93, "longitude": 77.62 },
  "data": [
    {
      "_id": "turf_id",
      "name": "Green Park Turf",
      "location": "Bangalore",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "distance": 2.15,
      "priceSlots": {
        "morning": 500,
        "afternoon": 700,
        "evening": 1000
      },
      "isActive": true
    }
  ]
}
~~~

Availability response:

~~~json
{
  "success": true,
  "data": {
    "turfId": "turf_id",
    "date": "2026-04-18",
    "bookedSlots": ["6PM-7PM"],
    "availableSlots": ["7PM-8PM", "8PM-9PM"]
  }
}
~~~

### Minimum Turf Fields in UI

- id (_id)
- name
- address/location
- latitude
- longitude
- distance
- availability slots for selected date
- optional: phone/email, pricing buckets

### Sorting and Filtering

- Sort by:
  - distance ascending (default)
  - name alphabetical
- Filter by:
  - all turfs
  - only turfs with available slots on selected date

## 4) UX Considerations

- Loading states:
  - full page spinner while initial location/data load runs
  - per-turf availability loader
- Error handling:
  - toast for API failures
  - fallback copy for denied permissions
  - empty states for no nearby turfs / no available slots
- Accessibility:
  - keyboard-selectable turf cards
  - ARIA labels for map/view/filter controls
  - role="status" and aria-live for permission and loading messages
  - sufficient focus styles and color contrast

## 5) Implementation Plan

### Core Components

- MapPage container:
  - orchestrates location, nearby turf fetch, sorting/filtering, selected turf state
- MapComponent:
  - renders map, user marker, turf markers, popups
- SelectedTurfPanel:
  - selected turf details + date picker + availability slots + booking actions
- TurfList:
  - card list mirroring map results, selectable and keyboard accessible

### State Management

- Keep local component state for this feature (React useState/useMemo/useEffect).
- Reuse existing API service layer for requests.
- Cache availability by turf+date key (example: turfId:YYYY-MM-DD).

### Minimal MVP Tasks

1. Permission and location request flow with fallback.
2. Nearby turf map/list rendering.
3. Turf selection and date-wise availability fetch.
4. Sort/filter controls.
5. Loading/error/empty states and accessibility pass.

### Code Skeletons

#### A) Request and Handle User Location

~~~jsx
const DEFAULT_LOCATION = { latitude: 13.0827, longitude: 80.2707 };

const requestUserLocation = () => {
  if (!navigator.geolocation) {
    setUserLocation(DEFAULT_LOCATION);
    setLocationMessage('Geolocation unavailable. Showing default city.');
    fetchNearbyTurfs(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      await fetchNearbyTurfs(latitude, longitude);
    },
    async () => {
      setUserLocation(DEFAULT_LOCATION);
      setLocationMessage('Location denied. Showing default city.');
      await fetchNearbyTurfs(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
  );
};
~~~

#### B) Render Map with Nearby Turf Markers

~~~jsx
<MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap contributors"
  />

  <Marker position={[userLocation.latitude, userLocation.longitude]} />

  {turfs.map((turf) => (
    <Marker
      key={turf._id}
      position={[turf.latitude, turf.longitude]}
      eventHandlers={{ click: () => onSelectTurf(turf._id) }}
    />
  ))}
</MapContainer>
~~~

#### C) List Turf Options with Distance

~~~jsx
<ul>
  {displayTurfs.map((turf) => (
    <li key={turf._id}>
      <button onClick={() => onSelectTurf(turf._id)}>
        <div>{turf.name}</div>
        <div>{turf.location}</div>
        <div>{turf.distance ?? 'N/A'} km</div>
      </button>
    </li>
  ))}
</ul>
~~~

## 6) Privacy and Permission Messaging

- Ask for location only when user enters map discovery flow.
- Explain purpose clearly before prompt:
  - "We use your location only to show nearby turfs and improve distance sorting."
- Avoid collecting precise location server-side unless required.
- Send only needed coordinates to nearby endpoint.
- Do not persist raw location longer than necessary for active session.
- Provide clear non-blocking fallback when user declines permission.

## Recommended Tech Choices (React Frontend)

- Map: Leaflet + react-leaflet (already integrated).
- Data fetching: axios via centralized api service (already integrated).
- State management: local state + memoization for MVP; consider React Query later for caching/retries.
- Notifications: existing toast context for request errors and status updates.
