import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { mockLocations } from '../services/mockData';

// Fix default marker icons for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapControls({ center }) {
  const map = useMap();
  const handleLocate = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: 1.5 }),
      () => alert('Không thể lấy vị trí của bạn')
    );
  };
  return (
    <button
      onClick={handleLocate}
      style={{
        position: 'absolute', bottom: 24, right: 24, zIndex: 999,
        background: 'white', border: '1px solid var(--border-color)',
        borderRadius: '50%', width: 44, height: 44,
        fontSize: '1.2rem', cursor: 'pointer',
        boxShadow: 'var(--shadow-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      aria-label="Vị trí của tôi"
      id="locate-btn"
    >
      📍
    </button>
  );
}

export default function MapPage({ onNavigateToDetail }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const categories = ['all', 'Phở', 'Bún Bò', 'Chả Cá', 'Bánh Mì', 'Cơm Tấm'];

  const filtered = mockLocations.filter(loc => {
    const matchSearch = !search || loc.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || loc.category === activeCategory;
    return matchSearch && matchCat;
  });

  const center = [21.0285, 105.8048]; // Hà Nội

  return (
    <div className="lf-map-page" id="map-page">
      {/* Controls */}
      <div className="map-controls">
        <div className="map-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Tìm quán ăn trên bản đồ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="map-search-input"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              id={`map-filter-${cat}`}
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            >
              {cat === 'all' ? '🍽️ Tất cả' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="map-container" style={{ position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          id="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map(loc => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              eventHandlers={{ click: () => setSelectedLocation(loc) }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: 6 }}>{loc.emoji}</div>
                  <strong style={{ fontSize: '0.95rem' }}>{loc.name}</strong>
                  <div style={{ color: '#8e8e8e', fontSize: '0.8rem', margin: '4px 0' }}>📍 {loc.address}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>⭐ {loc.rating}</span>
                    <span style={{
                      fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999,
                      background: loc.open ? '#e6f4ea' : '#fce8e6',
                      color: loc.open ? '#1e7e34' : '#c5221f', fontWeight: 600
                    }}>
                      {loc.open ? 'Đang mở' : 'Đóng cửa'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#0095f6', marginTop: 6, cursor: 'pointer' }}
                    onClick={() => onNavigateToDetail && onNavigateToDetail(loc.id)}>
                    Xem chi tiết →
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapControls center={center} />
        </MapContainer>
      </div>

      {/* Bottom sheet: selected location */}
      {selectedLocation && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderRadius: '20px 20px 0 0',
          padding: '20px 24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
          zIndex: 10, animation: 'fadeIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 12,
                background: 'linear-gradient(135deg, #f58529, #dd2a7b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
              }}>{selectedLocation.emoji}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedLocation.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 2 }}>
                  ⭐ {selectedLocation.rating} · {selectedLocation.priceRange}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  📍 {selectedLocation.address}
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedLocation(null)} style={{ fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 14, width: '100%' }}
            onClick={() => onNavigateToDetail && onNavigateToDetail(selectedLocation.id)}
          >
            Xem chi tiết
          </button>
        </div>
      )}
    </div>
  );
}
