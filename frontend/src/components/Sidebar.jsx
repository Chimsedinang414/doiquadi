import React from 'react';
import Icon from '../styles/icon';

export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ' },
    { id: 'explore', icon: 'search', label: 'Khám phá' },
    { id: 'map', icon: 'marker', label: 'Bản đồ' },
    { id: 'add', icon: 'plus', label: 'Thêm quán' },
    { id: 'saved', icon: 'bookmark', label: 'Đã lưu' },
    { id: 'notifications', icon: 'envelope', label: 'Thông báo' },
    { id: 'profile', icon: 'user', label: 'Trang cá nhân' },
  ];

  return (
    <nav className="lf-sidebar" role="navigation" aria-label="Navigation chính">
      {/* Logo */}
      <div className="lf-logo">
        <div className="lf-logo-icon">
          <Icon name="home" alt="LocalFood" className="lf-logo-icon-svg" />
        </div>
        <span className="lf-logo-text">LocalFood</span>
      </div>

      {/* Nav items */}
      <div className="lf-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`lf-nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-label={item.label}
            id={`nav-${item.id}`}
          >
            <span className="lf-nav-icon"><Icon name={item.icon} alt={item.label} className="nav-item-icon" /></span>
            <span className="lf-nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="lf-sidebar-footer">
        <div className="lf-sidebar-user">
          <div className="lf-sidebar-avatar">😋</div>
          <div>
            <div className="lf-sidebar-username">foodie_vn</div>
            <div className="lf-sidebar-handle">@foodie.vn</div>
          </div>
        </div>
      </div>
    </nav>
  );
}
