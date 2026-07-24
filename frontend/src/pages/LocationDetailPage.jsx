import React, { useEffect, useMemo, useState } from 'react';
import { api, getCurrentUser, toPostView } from '../services/api';
import Icon from '../styles/icon';

export default function LocationDetailPage({ locationId, onBack }) {
  const [location, setLocation] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const currentUser = getCurrentUser();

  useEffect(() => {
    setError('');
    Promise.all([api.getLocation(locationId), api.getPosts()])
      .then(([locationData, postData]) => {
        setLocation(locationData);
        setPosts(postData.filter(post => post.location?.id === locationId).map(toPostView));
      })
      .catch(err => setError(err.message));
  }, [locationId]);

  const averageRating = useMemo(() => {
    const rated = posts.filter(post => post.rating > 0);
    return rated.length
      ? (rated.reduce((sum, post) => sum + post.rating, 0) / rated.length).toFixed(1)
      : 'Chưa có';
  }, [posts]);

  const toggleSave = async () => {
    if (!currentUser?.id) {
      setError('Bạn cần đăng nhập để lưu địa điểm');
      return;
    }
    try {
      const result = await api.toggleFavorite({ userId: currentUser.id, locationId });
      setSaved(result.active);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !location) {
    return <div className="lf-detail-page"><button onClick={onBack}>← Quay lại</button><p style={{ color: '#c5221f' }}>{error}</p></div>;
  }
  if (!location) return <div className="lf-detail-page">Đang tải địa điểm...</div>;

  return (
    <div className="lf-detail-page" id="detail-page">
      <button onClick={onBack} id="detail-back-btn">← Quay lại</button>
      {error && <p style={{ color: '#c5221f' }}>{error}</p>}

      <div className="detail-hero">
        <div className="detail-hero-main" style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b)' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="picture" alt="" className="detail-placeholder-icon" />
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{location.name}</span>
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-info">
          <h1 className="detail-title">{location.name}</h1>
          <div className="detail-meta-row">
            <span className="detail-badge">★ {averageRating}</span>
            {location.averagePrice && (
              <span className="detail-badge">{Number(location.averagePrice).toLocaleString('vi-VN')}đ</span>
            )}
          </div>
          <div className="detail-actions-row">
            <button className="btn-outline" onClick={toggleSave}>
              <Icon name="bookmark" alt="" className="inline-icon" />
              {saved ? 'Đã lưu' : 'Lưu'}
            </button>
          </div>
          <div className="detail-address">
            <Icon name="marker" alt="" className="inline-icon" />
            {location.address || 'Chưa có địa chỉ'}
          </div>

          <div className="reviews-section">
            <h2>Bài viết tại địa điểm ({posts.length})</h2>
            {posts.length === 0 && <p>Chưa có bài viết nào cho địa điểm này.</p>}
            {posts.map(post => (
              <div key={post.id} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">{post.author?.userName?.[0]?.toUpperCase() || 'U'}</div>
                  <div>
                    <div className="review-username">{post.author?.userName || 'Người dùng'}</div>
                    <div className="review-stars">★ {post.rating || 'Chưa đánh giá'}</div>
                  </div>
                  <span className="review-time">{post.time}</span>
                </div>
                <p className="review-text"><strong>{post.restaurantName}</strong> — {post.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="detail-sidebar-card">
            <div className="sidebar-card-title">Thông tin</div>
            <p><strong>Giờ mở:</strong> {location.openTime || '--:--'} – {location.closeTime || '--:--'}</p>
            <p><strong>Điện thoại:</strong> {location.phone || 'Chưa có'}</p>
            <p className="detail-coordinate">
              <Icon name="thumbtack" alt="" className="inline-icon" />
              {location.latitude ?? '-'}, {location.longitude ?? '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}