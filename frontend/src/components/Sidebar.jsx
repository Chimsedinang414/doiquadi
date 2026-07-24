import React, { useEffect, useState } from 'react';
import Icon from '../styles/icon';
import { getCurrentUser } from '../services/api';

export default function Sidebar({ activePage, onNavigate, onProfileOpen }) {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const navItems = [
    { id: 'home', icon: 'home', label: 'Trang chủ' },
    { id: 'explore', icon: 'search', label: 'Khám phá' },
    { id: 'map', icon: 'marker', label: 'Bản đồ' },
    { id: 'add', icon: 'plus', label: 'Thêm quán' },
    { id: 'saved', icon: 'bookmark', label: 'Đã lưu' },
    { id: 'notifications', icon: 'envelope', label: 'Thông báo' },
  ];

  return (
    <nav className="lf-sidebar" aria-label="Điều hướng chính">
      <div className="lf-logo">
        <div className="lf-logo-icon"><Icon name="home" alt="LocalFood" className="lf-logo-icon-svg" /></div>
        <span className="lf-logo-text">LocalFood</span>
      </div>
      <div className="lf-nav">
        {navItems.map(item => (
          <button key={item.id}
            className={'lf-nav-item ' + (activePage === item.id ? 'active' : '')}
            onClick={() => onNavigate(item.id)}>
            <span className="lf-nav-icon"><Icon name={item.icon} alt="" className="nav-item-icon" /></span>
            <span className="lf-nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="lf-sidebar-footer">
        <button className="lf-sidebar-user sidebar-profile-button"
          onClick={() => onProfileOpen(user?.id)} id="sidebar-profile-button">
          <div className="lf-sidebar-avatar">
            {user?.avatar
              ? <img src={user.avatar} alt="" />
              : user?.userName?.[0]?.toUpperCase() || <Icon name="user" alt="" className="avatar-fallback-icon" />}
          </div>
          <div>
            <div className="lf-sidebar-username">{user?.userName || 'Hồ sơ cá nhân'}</div>
            <div className="lf-sidebar-handle">{user?.email || 'Xem hoặc chỉnh sửa hồ sơ'}</div>
          </div>
        </button>
      </div>
    </nav>
  );
}