import React from 'react';

export default function RightSidebar({ posts = [], currentUser }) {
  const trends = [...new Set(posts.flatMap(post => post.tags || []))].slice(0, 5);

  return (
    <aside className="lf-right-sidebar">
      <div className="profile-card">
        <div className="profile-card-avatar"><span style={{ fontSize: '1.4rem' }}>😋</span></div>
        <div className="profile-card-info">
          <div className="profile-card-name">{currentUser?.userName || 'Khách'}</div>
          <div className="profile-card-handle">{currentUser?.email || 'Chưa đăng nhập'}</div>
        </div>
      </div>
      <div className="trends-section">
        <div className="trends-title">Xu hướng ẩm thực</div>
        {trends.length === 0 && <div className="trend-item">Chưa có dữ liệu</div>}
        {trends.map(tag => <div key={tag} className="trend-item"><span className="trend-tag">{tag}</span></div>)}
      </div>
    </aside>
  );
}