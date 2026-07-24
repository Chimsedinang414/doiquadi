import React, { useEffect, useMemo, useState } from 'react';
import './styles/index.css';
import './styles/App.css';
import './styles/Profile.css';
import './styles/Social.css';
import Icon from './styles/icon';

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
import SettingsPage from './pages/SettingsPage';
import { api, getCurrentUser } from './services/api';

export default function App() {
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);
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

  const openProfile = userId => {
    setProfileUserId(userId || getCurrentUser()?.id || null);
    setPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = nextPage => {
    if (nextPage === 'profile') {
      openProfile();
      return;
    }
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToDetail = id => {
    setDetailId(id);
    setPage('detail');
    setShowSearch(false);
  };

  const openAuth = mode => {
    setAuthMode(mode);
    setProfileUserId(null);
    setPage('profile');
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage onProfileOpen={openProfile} onAuthNavigate={openAuth} />;
      case 'explore': return <ExplorePage onNavigateToDetail={goToDetail} />;
      case 'map': return <MapPage onNavigateToDetail={goToDetail} />;
      case 'add': return <AddLocationPage onBack={() => navigate('home')} />;
      case 'detail': return <LocationDetailPage locationId={detailId} onBack={() => navigate('home')} />;
      case 'saved': return <SavedPage onNavigateToDetail={goToDetail} />;
      case 'notifications': return <NotificationsPage />;
      case 'profile': return <ProfilePage initialMode={authMode} profileUserId={profileUserId}
        onNavigateToDetail={goToDetail} onSettings={() => navigate('settings')} />;
      case 'settings': return <SettingsPage onProfileOpen={openProfile}
        onAuthNavigate={openAuth} />;
      default: return <HomePage onProfileOpen={openProfile} onAuthNavigate={openAuth} />;
    }
  };

  return (
    <div className="lf-app">
      <Sidebar activePage={page} onNavigate={navigate} onProfileOpen={openProfile} />
      <main className="lf-main">
        <TopBar activePage={page} onNavigate={navigate} onSearchOpen={() => setShowSearch(true)}
          onAuthNavigate={openAuth} />
        {renderPage()}
      </main>

      {showSearch && (
        <div className="search-overlay" onClick={event => event.target === event.currentTarget && setShowSearch(false)}>
          <div className="search-panel">
            <div className="search-input-wrap">
              <Icon name="search" alt="" className="search-field-icon" />
              <input className="search-input" placeholder="Tìm địa điểm..."
                value={searchQuery} onChange={event => setSearchQuery(event.target.value)} autoFocus />
              <button onClick={() => setShowSearch(false)}>✕</button>
            </div>
            <div className="search-results">
              {searchResults.map(location => (
                <button key={location.id} className="search-result-item" onClick={() => goToDetail(location.id)}>
                  <div className="search-result-icon"><Icon name="marker" alt="" /></div>
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