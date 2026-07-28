import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Icon from '../styles/icon';

export default function ExplorePage({ onNavigateToDetail }) {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLocations().then(setLocations).catch(err => setError(err.message));
  }, []);

  const filtered = locations.filter(location =>
    !search
    || location.name.toLowerCase().includes(search.toLowerCase())
    || (location.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lf-explore" id="explore-page">
      <div className="explore-search-bar">
        <Icon name="search" alt="" className="search-field-icon" />
        <input
          type="text"
          placeholder="Tìm quán ăn hoặc địa chỉ..."
          value={search}
          onChange={event => setSearch(event.target.value)}
          id="explore-search-input"
        />
      </div>
      {error && <div style={{ padding: 16, color: '#c5221f' }}>{error}</div>}
      <div className="explore-grid">
        {filtered.map(location => (
          <div
            key={location.id}
            className="explore-grid-item"
            onClick={() => onNavigateToDetail?.(location.id)}
            title={location.name}
          >
            {location.imageUrls?.[0] ? (
              <img className="explore-img" src={location.imageUrls[0]} alt={location.name} />
            ) : (
              <div className="explore-img explore-placeholder"
                style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b)' }}>
                <Icon name="picture" alt="" className="grid-placeholder-icon" />
              </div>
            )}
            <div className="explore-overlay">
              <span>{location.name}</span>
              <span>{location.averagePrice ? Number(location.averagePrice).toLocaleString('vi-VN') + 'đ' : ''}</span>
            </div>
          </div>
        ))}
      </div>
      {!error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60 }}>Không tìm thấy địa điểm.</div>
      )}
    </div>
  );
}
