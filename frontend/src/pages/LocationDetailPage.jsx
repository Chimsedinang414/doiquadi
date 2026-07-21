import React from 'react';
import { mockDetailLocation } from '../services/mockData';

function StarRow({ rating }) {
  return (
    <span className="stars">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function LocationDetailPage({ locationId, onBack }) {
  const loc = mockDetailLocation; // In real app, fetch by locationId
  const [liked, setLiked] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [following, setFollowing] = React.useState(false);

  const imageColors = [
    'linear-gradient(135deg, #ff7043, #ff5722)',
    'linear-gradient(135deg, #e53935, #b71c1c)',
    'linear-gradient(135deg, #ffa000, #e65100)',
    'linear-gradient(135deg, #7b1fa2, #4a148c)',
  ];

  return (
    <div className="lf-detail-page" id="detail-page">
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 20, fontWeight: 600, fontSize: '0.92rem',
          color: 'var(--text-primary)', cursor: 'pointer',
        }}
        id="detail-back-btn"
      >
        ← Quay lại
      </button>

      {/* Hero images */}
      <div className="detail-hero">
        <div className="detail-hero-main" style={{ background: imageColors[0] }}>
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <span style={{ fontSize: '5rem' }}>{loc.emoji}</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1.2rem' }}>{loc.name}</span>
          </div>
        </div>
        <div className="detail-hero-grid">
          {imageColors.slice(1).map((bg, i) => (
            <div key={i} className="detail-hero-small" style={{ background: bg }}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.5rem' }}>{loc.foods?.[i]?.emoji || '🍽️'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Left content */}
        <div className="detail-info">
          {/* Title & meta */}
          <div>
            <h1 className="detail-title">{loc.name}</h1>
            <div className="detail-meta-row" style={{ marginTop: 10 }}>
              <div className="detail-rating">
                <StarRow rating={loc.rating} />
                <strong>{loc.rating}</strong>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
                  ({loc.reviews >= 1000 ? `${(loc.reviews/1000).toFixed(1)}k` : loc.reviews} đánh giá)
                </span>
              </div>
              <span className={`detail-badge ${loc.open ? 'open' : 'closed'}`}>
                {loc.open ? '🟢 Đang mở' : '🔴 Đóng cửa'}
              </span>
              <span className="detail-badge">{loc.category}</span>
              <span className="detail-badge">💰 {loc.priceRange}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions-row">
            <button
              className={`btn-primary ${following ? '' : ''}`}
              onClick={() => setFollowing(!following)}
              id="follow-btn"
            >
              {following ? '✓ Đã theo dõi' : '+ Theo dõi'}
            </button>
            <button className="btn-outline" id="review-btn">⭐ Đánh giá</button>
            <button
              className="btn-outline"
              onClick={() => setLiked(!liked)}
              style={liked ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}
              id="like-btn"
            >
              {liked ? '❤️' : '🤍'} {loc.likes + (liked ? 1 : 0)}
            </button>
            <button
              className="btn-outline"
              onClick={() => setSaved(!saved)}
              id="save-btn"
            >
              {saved ? '🔖 Đã lưu' : '📑 Lưu'}
            </button>
          </div>

          {/* Address */}
          <div className="detail-address">
            <span>📍</span>
            <span>{loc.address}</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {loc.description}
          </p>

          {/* Menu */}
          <div>
            <h2 className="detail-menu-title">🍽️ Thực đơn nổi bật</h2>
            <div className="food-grid">
              {loc.foods?.map(food => (
                <div key={food.id} className="food-item-card">
                  <div className="food-item-img">
                    <span style={{ fontSize: '2.5rem' }}>{food.emoji}</span>
                  </div>
                  <div className="food-item-info">
                    <div className="food-item-name">{food.name}</div>
                    <div className="food-item-price">{food.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="reviews-section">
            <h2>💬 Đánh giá ({loc.reviews})</h2>
            {loc.reviews_list?.map(r => (
              <div key={r.id} className="review-card">
                <div className="review-header">
                  <div className="review-avatar">{r.username[0].toUpperCase()}</div>
                  <div>
                    <div className="review-username">{r.username}</div>
                    <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                  </div>
                  <span className="review-time">{r.time}</span>
                </div>
                <p className="review-text">{r.comment}</p>
              </div>
            ))}
            {loc.reviews?.length > 0 && loc.reviews_list === undefined && (
              mockDetailLocation.reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar" style={{ background: 'var(--ig-gradient)' }}>
                      {r.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="review-username">{r.username}</div>
                      <div className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    </div>
                    <span className="review-time">{r.time}</span>
                  </div>
                  <p className="review-text">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="detail-sidebar">
          {/* Follower stats */}
          <div className="detail-sidebar-card">
            <div className="sidebar-card-title">📊 Thống kê</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Đánh giá', value: loc.rating, icon: '⭐' },
                { label: 'Đã đánh giá', value: `${loc.reviews >= 1000 ? `${(loc.reviews/1000).toFixed(1)}k` : loc.reviews}`, icon: '💬' },
                { label: 'Lượt thích', value: `${(loc.likes/1000).toFixed(1)}k`, icon: '❤️' },
                { label: 'Theo dõi', value: loc.followers, icon: '👥' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)',
                  padding: '12px', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.3rem' }}>{stat.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: 4 }}>{stat.value}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="detail-sidebar-card">
            <div className="sidebar-card-title">🕐 Giờ mở cửa</div>
            <div className="opening-hours-list">
              {loc.hours?.map(h => (
                <div key={h.day} className={`hour-row ${h.today ? 'today' : ''}`}>
                  <span className="day">{h.day}</span>
                  <span className="time">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="detail-sidebar-card">
            <div className="sidebar-card-title">📞 Liên hệ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <span>📱</span>
                <a href={`tel:${loc.phone}`} style={{ color: 'var(--primary)' }}>{loc.phone}</a>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <span>🌐</span>
                <a href="#" style={{ color: 'var(--primary)' }}>{loc.website}</a>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.88rem' }}>
                <span>📍</span>
                <span style={{ color: 'var(--text-secondary)' }}>{loc.address}</span>
              </div>
            </div>
          </div>

          {/* Directions */}
          <button
            className="btn-primary"
            style={{ width: '100%', padding: '14px' }}
            id="directions-btn"
          >
            🗺️ Chỉ đường đến đây
          </button>
        </div>
      </div>
    </div>
  );
}
