import React, { useState } from 'react';
import { mockSuggestions, mockTrends, mockUser } from '../services/mockData';

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  const toggleFollow = (id) => {
    setSuggestions(prev =>
      prev.map(s => s.id === id ? { ...s, following: !s.following } : s)
    );
  };

  return (
    <aside className="lf-right-sidebar">
      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-card-avatar" title="Trang cá nhân">
          <span style={{ fontSize: '1.4rem' }}>😋</span>
        </div>
        <div className="profile-card-info">
          <div className="profile-card-name">{mockUser.username}</div>
          <div className="profile-card-handle">{mockUser.displayName}</div>
        </div>
        <button className="profile-card-switch">Chuyển</button>
      </div>

      {/* Suggestions */}
      <div className="suggestions-section">
        <div className="suggestions-header">
          <span className="suggestions-title">Gợi ý cho bạn</span>
          <button className="suggestions-see-all">Xem tất cả</button>
        </div>

        {suggestions.map((s, i) => (
          <div
            key={s.id}
            className="suggestion-item"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div
              className="suggestion-avatar"
              style={{
                background: `linear-gradient(135deg, ${s.gradient?.[0] || '#f58529'}, ${s.gradient?.[1] || '#dd2a7b'})`,
                fontSize: '1.1rem',
              }}
            >
              {s.initials}
            </div>
            <div className="suggestion-info">
              <div className="suggestion-name">{s.name}</div>
              <div className="suggestion-meta">{s.handle}</div>
            </div>
            <button
              className={`btn-follow ${s.following ? 'following' : ''}`}
              onClick={() => toggleFollow(s.id)}
            >
              {s.following ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>
        ))}
      </div>

      {/* Trending Tags */}
      <div className="trends-section">
        <div className="trends-title">Xu hướng ẩm thực</div>
        {mockTrends.map(trend => (
          <div key={trend.tag} className="trend-item">
            <span className="trend-tag">{trend.tag}</span>
            <span className="trend-count">{trend.count}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer-links">
        {['Giới thiệu', 'Trợ giúp', 'Báo cáo', 'Quyền riêng tư', 'Điều khoản', 'Vị trí', 'Ngôn ngữ'].map(link => (
          <a key={link} href="#">{link}</a>
        ))}
        <a href="#" style={{ marginTop: 6, color: 'var(--text-light)', fontWeight: 400 }}>
          © 2024 LOCALFOOD VN
        </a>
      </div>
    </aside>
  );
}
