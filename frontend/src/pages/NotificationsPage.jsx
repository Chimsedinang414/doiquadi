import React, { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../services/api';

export default function NotificationsPage() {
  const user = getCurrentUser();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) api.getNotifications(user.id).then(setItems).catch(err => setError(err.message));
  }, [user?.id]);

  const markRead = async item => {
    if (item.read) return;
    try {
      const updated = await api.markNotificationRead(item.id, user.id);
      setItems(previous => previous.map(value => value.id === item.id ? updated : value));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div style={{ padding: 48, textAlign: 'center' }}>Bạn cần đăng nhập để xem thông báo.</div>;
  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <h2>Thông báo</h2>
      {error && <p style={{ color: '#c5221f' }}>{error}</p>}
      {items.map(item => (
        <button key={item.id} onClick={() => markRead(item)}
          style={{ display: 'block', width: '100%', padding: 16, marginTop: 8, textAlign: 'left', opacity: item.read ? 0.6 : 1 }}>
          <strong>{item.type}</strong> · {new Date(item.createdAt).toLocaleString('vi-VN')}
        </button>
      ))}
      {!error && items.length === 0 && <p>Chưa có thông báo.</p>}
    </div>
  );
}