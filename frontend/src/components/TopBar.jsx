import React, { useEffect, useState } from 'react';
import { MessageCircle, Moon, Sun } from 'lucide-react';
import Icon from '../styles/icon';
import { clearAuthSession, getCurrentUser } from '../services/api';

export default function TopBar({ activePage, onNavigate, onSearchOpen, onAuthNavigate, theme, onThemeToggle }) {
  const [user, setUser] = useState(getCurrentUser());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = event => {
      if (menuOpen && event.target instanceof Element && !event.target.closest('.auth-account-menu')) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = event => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setMenuOpen(false);
  };

  const navItems = [
    { id: 'home', icon: 'home' },
    { id: 'explore', icon: 'search' },
    { id: 'map', icon: 'marker' },
    { id: 'add', icon: 'plus' },
    { id: 'chat', icon: 'chat' },
    { id: 'profile', icon: 'user' },
  ];

  const ThemeToggle = ({ compact = false }) => {
    const isDark = theme === 'dark';
    const label = isDark ? 'Bật chế độ sáng' : 'Bật chế độ tối';

    return (
      <button
        className={'theme-toggle-button' + (compact ? ' compact' : '')}
        type="button"
        onClick={onThemeToggle}
        aria-label={label}
        aria-pressed={isDark}
        title={label}
      >
        {isDark
          ? <Sun className="theme-toggle-icon" aria-hidden="true" />
          : <Moon className="theme-toggle-icon" aria-hidden="true" />}
      </button>
    );
  };

  const AccountControl = ({ compact = false }) => (
    <div className={'auth-account-menu' + (compact ? ' compact' : '')}>
      <button
        className={'auth-user-chip' + (compact ? ' compact' : '')}
        type="button"
        onClick={() => setMenuOpen(previous => !previous)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={'M\u1edf menu t\u00e0i kho\u1ea3n'}
      >
        <span className="auth-user-avatar">
          {user.avatar ? <img src={user.avatar} alt="" /> : user.userName?.[0]?.toUpperCase()}
        </span>
        {!compact && <span>{user.userName}</span>}
      </button>
      {menuOpen && (
        <div className="auth-account-popover" role="menu" aria-label={'T\u00f9y ch\u1ecdn t\u00e0i kho\u1ea3n'}>
          <button className="account-settings-button" type="button" role="menuitem"
            onClick={() => { setMenuOpen(false); onNavigate('settings'); }}
            aria-label={'C\u00e0i \u0111\u1eb7t'} title={'C\u00e0i \u0111\u1eb7t'}>
            <Icon name="settings" alt="" />
          </button>
          <button className="account-logout-button" type="button" role="menuitem" onClick={logout}>
            <Icon name="exit" alt="" />
            <span>{'\u0110\u0103ng xu\u1ea5t'}</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="lf-desktop-auth" aria-label="Tài khoản">
        <ThemeToggle />
        {user ? (
          <AccountControl />
        ) : (
          <>
            <button className="auth-login-button" onClick={() => onAuthNavigate('login')}>Đăng nhập</button>
            <button className="auth-register-button" onClick={() => onAuthNavigate('register')}>Đăng ký</button>
          </>
        )}
      </div>

      <header className="lf-topbar">
        <span className="lf-topbar-brand">
          <Icon name="localfood" alt="" className="topbar-brand-icon lf-app-logo" />
          LocalFood
        </span>
        <div className="lf-topbar-actions">
          <ThemeToggle compact />
          <button className="lf-topbar-btn" onClick={onSearchOpen} aria-label="Tìm kiếm">
            <Icon name="search" alt="" className="topbar-icon" />
          </button>
          {user ? (
            <AccountControl compact />
          ) : (
            <button className="auth-register-button compact" onClick={() => onAuthNavigate('login')}>
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      <nav className="lf-bottom-nav" aria-label="Điều hướng mobile">
        <div className="lf-bottom-nav-inner">
          {navItems.map(item => (
            <button key={item.id}
              className={'bottom-nav-btn ' + (activePage === item.id ? 'active' : '')}
              onClick={() => onNavigate(item.id)} aria-label={item.id}>
              {item.icon === 'chat'
                ? <MessageCircle className="bottom-nav-lucide-icon" aria-hidden="true" />
                : <Icon name={item.icon} alt="" className="bottom-nav-icon" />}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
