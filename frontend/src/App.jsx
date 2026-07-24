import React, { useEffect, useMemo, useState } from 'react';
import './styles/index.css';
import './styles/App.css';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import MapPage from './pages/MapPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AddLocationPage from './pages/AddLocationPage';
import SavedPage from './pages/SavedPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import { api } from './services/api';

export default function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    const handler = event => event.key === 'Escape' && setShowSearch(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return locations.filter(location =>
      location.name.toLowerCase().includes(query)
      || (location.address || '').toLowerCase().includes(query)
    ).slice(0, 8);
  }, [locations, searchQuery]);

  const navigate = nextPage => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToDetail = id => {
    setDetailId(id);
    setPage('detail');
    setShowSearch(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />;
      case 'explore': return <ExplorePage onNavigateToDetail={goToDetail} />;
      case 'map': return <MapPage onNavigateToDetail={goToDetail} />;
      case 'add': return <AddLocationPage onBack={() => navigate('home')} />;
      case 'detail': return <LocationDetailPage locationId={detailId} onBack={() => navigate('home')} />;
      case 'saved': return <SavedPage onNavigateToDetail={goToDetail} />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage initialMode={authMode} />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="lf-app">
      <Sidebar activePage={page} onNavigate={navigate} />
      <main className="lf-main">
        <TopBar activePage={page} onNavigate={navigate} onSearchOpen={() => setShowSearch(true)}
          onAuthNavigate={mode => { setAuthMode(mode); navigate('profile'); }} />
        {renderPage()}
      </main>

      {showSearch && (
        <div className="search-overlay" onClick={event => event.target === event.currentTarget && setShowSearch(false)}>
          <div className="search-panel">
            <div className="search-input-wrap">
              <span>🔍</span>
              <input className="search-input" placeholder="Tìm địa điểm..."
                value={searchQuery} onChange={event => setSearchQuery(event.target.value)} autoFocus />
              <button onClick={() => setShowSearch(false)}>✕</button>
            </div>
            <div className="search-results">
              {searchResults.map(location => (
                <button key={location.id} className="search-result-item" onClick={() => goToDetail(location.id)}>
                  <div className="search-result-icon">🍽️</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{location.name}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{location.address}</div>
                  </div>
                </button>
              ))}
              {searchQuery && searchResults.length === 0 && <div style={{ padding: 24 }}>Không tìm thấy địa điểm.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}