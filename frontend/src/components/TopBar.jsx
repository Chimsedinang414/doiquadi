import React from 'react';
import Icon from '../styles/icon';


export default function TopBar({ activePage, onNavigate, onSearchOpen }) {
  const navItems = [
    { id: 'home', icon: 'home' },
    { id: 'explore', icon: 'search' },
    { id: 'map', icon: 'marker' },
    { id: 'add', icon: 'plus' },
    { id: 'profile', icon: 'user' },
  ];

  return (
    <>
      {/* Mobile top header */}
      <header className="lf-topbar" role="banner">
        <span className="lf-topbar-brand">LocalFood 🍽️</span>
        <div className="lf-topbar-actions">
          <button
            className="lf-topbar-btn"
            onClick={onSearchOpen}
            aria-label="Tìm kiếm"
            id="topbar-search-btn"
          >
            <Icon name="search" alt="Tìm kiếm" className="topbar-icon" />
          </button>
          <button
            className="lf-topbar-btn"
            aria-label="Thông báo"
            id="topbar-notif-btn"
          >
            <Icon name="envelope" alt="Thông báo" className="topbar-icon" />
          </button>
          <button
            className="lf-topbar-btn"
            aria-label="Tin nhắn"
            id="topbar-msg-btn"
          >
            <Icon name="envelope" alt="Tin nhắn" className="topbar-icon" />
          </button>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="lf-bottom-nav" aria-label="Navigation mobile">
        <div className="lf-bottom-nav-inner">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`bottom-nav-btn ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-label={item.id}
              id={`mobile-nav-${item.id}`}
            >
              <Icon name={item.icon} alt={item.id} className="bottom-nav-icon" />
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
