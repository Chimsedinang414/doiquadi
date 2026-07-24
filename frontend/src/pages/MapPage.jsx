import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocateButton() {
  const map = useMap();
  return (
    <button className="btn-outline" style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 999 }}
      onClick={() => navigator.geolocation?.getCurrentPosition(
        position => map.flyTo([position.coords.latitude, position.coords.longitude], 15),
        () => alert('Không thể lấy vị trí của bạn')
      )}>
      📍
    </button>
  );
}

export default function MapPage({ onNavigateToDetail }) {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLocations().then(setLocations).catch(err => setError(err.message));
  }, []);

  const filtered = locations.filter(location =>
    location.latitude != null && location.longitude != null
    && (!search || location.name.toLowerCase().includes(search.toLowerCase()))
  );
  const center = filtered.length
    ? [filtered[0].latitude, filtered[0].longitude]
    : [21.0285, 105.8048];

  return (
    <div className="lf-map-page" id="map-page">
      <div className="map-controls">
        <div className="map-search">
          <span>🔍</span>
          <input value={search} onChange={event => setSearch(event.target.value)}
            placeholder="Tìm quán ăn trên bản đồ..." />
        </div>
        {error && <span style={{ color: '#c5221f' }}>{error}</span>}
      </div>
      <div className="map-container" style={{ position: 'relative' }}>
        <MapContainer key={center.join(',')} center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.map(location => (
            <Marker key={location.id} position={[location.latitude, location.longitude]}>
              <Popup>
                <strong>{location.name}</strong>
                <div>{location.address}</div>
                <button onClick={() => onNavigateToDetail?.(location.id)}>Xem chi tiết</button>
              </Popup>
            </Marker>
          ))}
          <LocateButton />
        </MapContainer>
      </div>
    </div>
  );
}