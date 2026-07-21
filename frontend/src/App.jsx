import React, { useState, useEffect } from 'react';
import './styles/index.css';
import './styles/App.css';
import Icon from './styles/icon';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AddLocationPage from './pages/AddLocationPage';

export default function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToDetail = (id) => {
    setDetailId(id);
    setPage('detail');
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Close search on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && setShowSearch(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage />;
      case 'explore':
        return <ExplorePage onNavigateToDetail={goToDetail} />;
      case 'map':
        return <MapPage onNavigateToDetail={goToDetail} />;
      case 'add':
        return <AddLocationPage onBack={() => navigate('home')} />;
      case 'detail':
        return <LocationDetailPage locationId={detailId} onBack={() => navigate('home')} />;
      case 'saved':
        return (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔖</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Đã lưu</h2>
            <p>Các quán ăn bạn đã lưu sẽ xuất hiện ở đây</p>
          </div>
        );
      case 'notifications':
        return (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔔</div>
            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Thông báo</h2>
            <p>Chưa có thông báo nào</p>
          </div>
        );
      case 'profile':
        return (
          <div style={{ padding: '40px 24px', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f58529, #dd2a7b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: 'white', fontWeight: 700,
              }}></div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 4 }}>foodie_vn</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>@foodie.vn</p>
                <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: '0.88rem' }}>
                  <div><strong>87</strong> <span style={{ color: 'var(--text-secondary)' }}>bài viết</span></div>
                  <div><strong>12.4k</strong> <span style={{ color: 'var(--text-secondary)' }}>người theo dõi</span></div>
                  <div><strong>342</strong> <span style={{ color: 'var(--text-secondary)' }}>đang theo dõi</span></div>
                </div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }}>Chỉnh sửa trang cá nhân</button>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="lf-app">
      {/* Desktop Sidebar */}
      <Sidebar activePage={page} onNavigate={navigate} />

      {/* Main area */}
      <main className="lf-main">
        {/* Mobile top + bottom nav */}
        <TopBar
          activePage={page}
          onNavigate={navigate}
          onSearchOpen={() => setShowSearch(true)}
        />

        {/* Page content */}
        {renderPage()}
      </main>

      {/* Search overlay */}
      {showSearch && (
        <div className="search-overlay" onClick={(e) => e.target === e.currentTarget && setShowSearch(false)}>
          <div className="search-panel">
            <div className="search-input-wrap">
              <Icon name="search" alt="Tìm kiếm" className="search-overlay-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Tìm quán ăn, món ăn, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                id="global-search-input"
              />
              <button onClick={() => setShowSearch(false)} style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>✕</button>
            </div>

            <div className="search-results" id="search-results">
              {searchQuery
                ? [
                    { id: 1, name: 'Phở Thìn Hà Nội', cat: 'Phở', emoji: '🍜' },
                    { id: 2, name: 'Bún Bò Bà Tư', cat: 'Bún Bò', emoji: '🥩' },
                    { id: 3, name: 'Bánh Mì Huỳnh Hoa', cat: 'Bánh Mì', emoji: '🥖' },
                  ]
                    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(r => (
                      <div
                        key={r.id}
                        className="search-result-item"
                        onClick={() => { goToDetail(r.id); setShowSearch(false); }}
                      >
                        <div className="search-result-icon">{r.emoji}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{r.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.cat}</div>
                        </div>
                      </div>
                    ))
                : (
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                    <p>Nhập tên quán hoặc món ăn để tìm kiếm</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast">{toast}</div>
        </div>
      )}
    </div>
  );
}
