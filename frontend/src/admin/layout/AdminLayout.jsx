import React, { useState } from 'react';
import {
  Bell,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquare,
  Moon,
  Newspaper,
  Flag,
  Search,
  ShieldCheck,
  Sun,
  Users,
  Utensils,
} from 'lucide-react';
import Icon from '../../styles/icon';
import { getUserDisplayName, getUserInitial } from '../../utils/userDisplay';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, roles: null },
  { id: 'users', label: 'Người dùng', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN'] },
  { id: 'posts', label: 'Bài viết', icon: Newspaper, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
  { id: 'comments', label: 'Bình luận', icon: MessageSquare, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
  { id: 'reports', label: 'Báo cáo', icon: Flag, roles: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] },
  { id: 'locations', label: 'Địa điểm', icon: MapPinned, roles: ['SUPER_ADMIN', 'ADMIN', 'LOCATION_MODERATOR'] },
  { id: 'dishes', label: 'Món ăn', icon: Utensils, roles: ['SUPER_ADMIN', 'ADMIN', 'LOCATION_MODERATOR'] },
  { id: 'audit', label: 'Nhật ký bảo mật', icon: ClipboardList, roles: ['SUPER_ADMIN', 'ADMIN', 'ANALYST'] },
];

export default function AdminLayout({ section, onSectionChange, user, onExit, children }) {
  const [lightTheme, setLightTheme] = useState(false);
  const visibleItems = NAV_ITEMS.filter(item => !item.roles || item.roles.some(role => user?.roles?.includes(role)));

  return (
    <div className={`admin-shell${lightTheme ? ' admin-light' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark"><Icon name="localfood" alt="LocalFood" /></span>
          <div><strong>LocalFood</strong><small>Admin workspace</small></div>
          <button type="button" className="admin-collapse-button" onClick={onExit} title="Về ứng dụng">
            <ChevronLeft size={18} />
          </button>
        </div>

        <span className="admin-nav-label">Quản trị</span>
        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          {visibleItems.map(item => {
            const NavIcon = item.icon;
            return (
              <button key={item.id} type="button" className={section === item.id ? 'active' : ''}
                onClick={() => onSectionChange(item.id)}>
                <NavIcon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.id === 'audit' && <em>SEC</em>}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-security">
          <ShieldCheck size={19} />
          <div><strong>Truy cập được bảo vệ</strong><small>Role được kiểm tra theo thời gian thực</small></div>
        </div>
        <div className="admin-account">
          <span>{user?.avatar ? <img src={user.avatar} alt="" /> : getUserInitial(user, 'A')}</span>
          <div><strong>{getUserDisplayName(user, 'Admin')}</strong><small>Administrator</small></div>
          <button type="button" onClick={onExit} title="Về ứng dụng"><LogOut size={18} /></button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <label className="admin-global-search">
            <Search size={18} />
            <input type="search" placeholder="Tìm kiếm trong trang quản trị..." aria-label="Tìm kiếm trong trang quản trị" />
            <kbd>/</kbd>
          </label>
          <div className="admin-topbar-actions">
            <button type="button" onClick={() => setLightTheme(value => !value)}
              aria-label={lightTheme ? 'Bật giao diện tối' : 'Bật giao diện sáng'}>
              {lightTheme ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <button type="button" aria-label="Thông báo" className="admin-notification-button">
              <Bell size={19} /><i />
            </button>
            <span className="admin-topbar-avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : getUserInitial(user, 'A')}
            </span>
          </div>
        </header>

        <main className="admin-main">
          <header className="admin-mobile-header">
            <span className="admin-mobile-brand"><Icon name="localfood" alt="" /> LocalFood Admin</span>
            <button type="button" onClick={onExit}><LogOut size={18} /></button>
          </header>
          <nav className="admin-mobile-nav">
            {visibleItems.map(item => {
              const NavIcon = item.icon;
              return (
                <button key={item.id} type="button" className={section === item.id ? 'active' : ''}
                  onClick={() => onSectionChange(item.id)}>
                  <NavIcon size={17} />{item.label}
                </button>
              );
            })}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
