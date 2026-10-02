import React, { useEffect, useMemo, useState } from 'react';
import { api, getCurrentUser, toPostView } from '../services/api';
import Icon from '../styles/icon';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

export default function LocationDetailPage({ locationId, onBack }) {
  const [location, setLocation] = useState(null);
  const [posts, setPosts] = useState([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [collectionError, setCollectionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    setError('');
    Promise.all([api.getLocation(locationId), api.getPosts()])
      .then(([locationData, postData]) => {
        setLocation(locationData);
        setPosts(postData.filter(post => post.location?.id === locationId).map(toPostView));
      })
      .catch(err => setError(err.message));
      
    if (currentUser?.id) {
      api.getCollections(currentUser.id).then(setCollections).catch(() => {});
    }
  }, [locationId, currentUser?.id]);

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

  const handleCheckin = async () => {
    if (!currentUser?.id) {
      setError('Bạn cần đăng nhập để check-in');
      return;
    }
    try {
      await api.checkin({ userId: currentUser.id, locationId });
      setSuccessMsg('Check-in thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;
    setIsSubmitting(true);
    setCollectionError('');
    try {
      const newCollection = await api.createCollection({ userId: currentUser.id, title: newCollectionTitle });
      setCollections([...collections, newCollection]);
      setNewCollectionTitle('');
    } catch (err) {
      setCollectionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCollection = async (collectionId) => {
    setIsSubmitting(true);
    try {
      await api.addCollectionItem(collectionId, { locationId });
      setShowCollectionModal(false);
      setSuccessMsg('Đã thêm vào bộ sưu tập!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setCollectionError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !location) {
    return <div className="lf-detail-page"><button onClick={onBack}>← Quay lại</button><p style={{ color: '#c5221f' }}>{error}</p></div>;
  }
  if (!location) return <div className="lf-detail-page">Đang tải địa điểm...</div>;

  return (
    <div className="lf-detail-page" id="detail-page">
      <button onClick={onBack} id="detail-back-btn">← Quay lại</button>
      {error && <p style={{ color: '#c5221f', marginBottom: 10 }}>{error}</p>}
      {successMsg && <p style={{ color: '#107c10', background: '#dff6dd', padding: '10px', borderRadius: '4px', marginBottom: 10 }}>{successMsg}</p>}

      <div className="detail-hero">
        <div className="detail-hero-main" style={{ background: 'linear-gradient(135deg, #f58529, #dd2a7b)' }}>
          {location.imageUrls?.[0] ? (
            <img src={location.imageUrls[0]} alt={location.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="picture" alt="" className="detail-placeholder-icon" />
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{location.name}</span>
            </div>
          )}
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
            <button className="btn-outline" onClick={handleCheckin}>
              <Icon name="marker" alt="" className="inline-icon" />
              Check-in
            </button>
            <button className="btn-outline" onClick={() => {
              if (!currentUser?.id) setError('Bạn cần đăng nhập để thêm vào bộ sưu tập');
              else setShowCollectionModal(true);
            }}>
              <Icon name="plus" alt="" className="inline-icon" />
              Bộ sưu tập
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
                  <div className="review-avatar">{getUserInitial(post.author)}</div>
                  <div>
                    <div className="review-username">{getUserDisplayName(post.author)}</div>
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
      
      {showCollectionModal && (
        <div className="edit-profile-modal-backdrop" onClick={() => setShowCollectionModal(false)}>
          <div className="edit-profile-modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="edit-profile-modal-header">
              <h2>Lưu vào bộ sưu tập</h2>
              <button type="button" className="close-modal-btn" onClick={() => setShowCollectionModal(false)}>&times;</button>
            </div>
            {collectionError && <div className="auth-error">{collectionError}</div>}
            
            <div style={{ margin: '1rem 0' }}>
              {collections.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {collections.map(col => (
                    <li key={col.id}>
                      <button onClick={() => handleAddToCollection(col.id)} disabled={isSubmitting} style={{ width: '100%', padding: '10px', textAlign: 'left', background: '#f3f4f6', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}>
                        {col.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666' }}>Bạn chưa có bộ sưu tập nào.</p>
              )}
            </div>

            <form onSubmit={handleCreateCollection} style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem', display: 'flex', gap: '8px' }}>
              <input required value={newCollectionTitle} onChange={e => setNewCollectionTitle(e.target.value)} placeholder="Tên bộ sưu tập mới..." style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
              <button type="submit" disabled={isSubmitting} style={{ background: '#f58529', color: 'white', border: 'none', padding: '0 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Tạo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
