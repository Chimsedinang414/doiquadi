import React, { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../services/api';

export default function SavedPage({ onNavigateToDetail }) {
  const user = getCurrentUser();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) api.getFavorites(user.id).then(setItems).catch(err => setError(err.message));
  }, [user?.id]);

  if (!user) return <div style={{ padding: 48, textAlign: 'center' }}>Bạn cần đăng nhập để xem địa điểm đã lưu.</div>;
  return (
    <div className="lf-explore">
      <h2>Địa điểm đã lưu</h2>
      {error && <p style={{ color: '#c5221f' }}>{error}</p>}
      <div className="explore-grid">
        {items.map(item => (
          <button key={item.location.id} className="explore-grid-item"
            onClick={() => onNavigateToDetail(item.location.id)}>
            <div className="explore-img explore-placeholder">🍽️</div>
            <div className="explore-overlay"><span>{item.location.name}</span></div>
          </button>
        ))}
      </div>
      {!error && items.length === 0 && <p>Chưa có địa điểm đã lưu.</p>}
    </div>
  );
}