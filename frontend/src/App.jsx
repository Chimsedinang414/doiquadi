import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './styles/index.css';
import './styles/App.css';
import './styles/Profile.css';
import './styles/Social.css';
import './styles/Chat.css';
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
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminPanel from './admin/AdminPanel';
import AdminRoute from './admin/guards/AdminRoute';
import './admin/styles/admin.css';
import { api, getCurrentUser } from './services/api';
import { getUserDisplayName, getUserInitial } from './utils/userDisplay';

const USER_THEME_KEY = 'localfood-user-theme';

function getInitialTheme() {
  try {
    const savedTheme = window.localStorage.getItem(USER_THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function pageFromPath() {
  if (window.location.pathname.startsWith('/admin')) return 'admin';
  switch (window.location.pathname) {
    case '/oauth2/callback': return 'oauth-callback';
    case '/forgot-password': return 'forgot-password';
    case '/reset-password': return 'reset-password';
    default: return getCurrentUser() ? 'home' : 'profile';
  }
}

export default function App() {
  const [page, setPage] = useState(pageFromPath);
  const [theme, setTheme] = useState(getInitialTheme);
  const [authUser, setAuthUser] = useState(getCurrentUser());
  const [detailId, setDetailId] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState([]);
  const [accountResults, setAccountResults] = useState([]);
  const [accountSearchLoading, setAccountSearchLoading] = useState(false);
  const [accountSearchError, setAccountSearchError] = useState('');
  const [accountFollowPending, setAccountFollowPending] = useState({});
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(USER_THEME_KEY, theme);
    } catch {
      // Keep the selected theme for this session when storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    if (!authUser) {
      setLocations([]);
      return;
    }
    api.getLocations().then(setLocations).catch(() => setLocations([]));
  }, [authUser]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!authUser || !showSearch || !query) {
      setAccountResults([]);
      setAccountSearchLoading(false);
      setAccountSearchError('');
      return undefined;
    }

    let active = true;
    setAccountResults([]);
    setAccountSearchLoading(true);
    setAccountSearchError('');
    const timer = window.setTimeout(() => {
      api.searchUsers(query)
        .then(results => {
          if (active) setAccountResults(results);
        })
        .catch(error => {
          if (active) {
            setAccountResults([]);
            setAccountSearchError(error.message);
          }
        })
        .finally(() => {
          if (active) setAccountSearchLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [authUser, searchQuery, showSearch]);

  useEffect(() => {
    const refreshAuth = () => {
      const nextUser = getCurrentUser();
      setAuthUser(nextUser);
      if (!nextUser) {
        setAuthMode('login');
        setPage('profile');
      }
    };
    window.addEventListener('auth-changed', refreshAuth);
    window.addEventListener('storage', refreshAuth);
    return () => {
      window.removeEventListener('auth-changed', refreshAuth);
      window.removeEventListener('storage', refreshAuth);
    };
  }, []);

  useEffect(() => {
    const handler = event => event.key === 'Escape' && setShowSearch(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const locationSearchResults = useMemo(() => {
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

  const toggleSearchFollow = async user => {
    if (!user?.id || accountFollowPending[user.id]) return;
    setAccountFollowPending(previous => ({ ...previous, [user.id]: true }));
    setAccountSearchError('');
    try {
      const result = await api.toggleFollow(user.id);
      setAccountResults(previous => previous.map(item => item.id === user.id
        ? { ...item, followedByViewer: result.active }
        : item));
    } catch (error) {
      setAccountSearchError(error.message);
    } finally {
      setAccountFollowPending(previous => ({ ...previous, [user.id]: false }));
    }
  };

  const navigate = nextPage => {
    if (!getCurrentUser() && ['add', 'saved', 'notifications', 'settings', 'chat'].includes(nextPage)) {
      openAuth('login');
      return;
    }
    if (nextPage === 'profile') {
      openProfile();
      return;
    }
    if (nextPage === 'admin') {
      window.history.pushState({}, document.title, '/admin');
      setPage('admin');
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

  const openForgotPassword = () => {
    window.history.pushState({}, document.title, '/forgot-password');
    setPage('forgot-password');
  };

  const returnToLogin = () => {
    window.history.replaceState({}, document.title, '/');
    setAuthMode('login');
    setProfileUserId(null);
    setPage('profile');
  };

  const exitAdmin = () => {
    window.history.replaceState({}, document.title, '/');
    setPage(getCurrentUser() ? 'home' : 'profile');
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
      case 'chat': return <ChatPage />;
      case 'profile': return <ProfilePage initialMode={authMode} profileUserId={profileUserId}
        onNavigateToDetail={goToDetail} onSettings={() => navigate('settings')}
        onForgotPassword={openForgotPassword} />;
      case 'settings': return <SettingsPage onProfileOpen={openProfile}
        onAuthNavigate={openAuth} />;
      case 'oauth-callback': return null;
      case 'forgot-password': return <ForgotPasswordPage onBackToLogin={returnToLogin} />;
      case 'reset-password': return <ResetPasswordPage onBackToLogin={returnToLogin} />;
      default: return <HomePage onProfileOpen={openProfile} onAuthNavigate={openAuth} />;
    }
  };

  const completeOAuth = useCallback(destination => setPage(destination || 'home'), []);
  const retryOAuth = useCallback(destination => {
    window.history.replaceState({}, document.title, '/');
    if (destination === 'settings' && getCurrentUser()) {
      setPage('settings');
      return;
    }
    setAuthMode('login');
    setPage('profile');
  }, []);

  if (page === 'oauth-callback') {
    return <OAuthCallbackPage onComplete={completeOAuth} onRetry={retryOAuth} />;
  }

  if (page === 'forgot-password' || page === 'reset-password') {
    return renderPage();
  }

  if (page === 'admin') {
    return (
      <AdminRoute user={authUser} onBack={exitAdmin}>
        <AdminPanel user={authUser} onExit={exitAdmin} />
      </AdminRoute>
    );
  }

  if (!authUser) {
    return (
      <div className="auth-gate-app">
        <ProfilePage initialMode={authMode} profileUserId={null}
          onNavigateToDetail={goToDetail} onSettings={() => navigate('settings')}
          onForgotPassword={openForgotPassword} />
      </div>
    );
  }

  return (
    <div className="lf-app">
      <Sidebar activePage={page} onNavigate={navigate} onProfileOpen={openProfile} />
      <main className="lf-main">
        <TopBar activePage={page} onNavigate={navigate} onSearchOpen={() => setShowSearch(true)}
          onAuthNavigate={openAuth} theme={theme}
          onThemeToggle={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        {renderPage()}
      </main>

      {showSearch && (
        <div className="search-overlay" onClick={event => event.target === event.currentTarget && setShowSearch(false)}>
          <div className="search-panel">
            <div className="search-input-wrap">
              <Icon name="search" alt="" className="search-field-icon" />
              <input className="search-input" placeholder="Tìm địa điểm hoặc tài khoản..."
                value={searchQuery} onChange={event => setSearchQuery(event.target.value)} autoFocus />
              <button onClick={() => setShowSearch(false)} aria-label="Đóng tìm kiếm">✕</button>
            </div>
            <div className="search-results">
              {searchQuery.trim() && (
                <>
                  <section className="search-results-section" aria-labelledby="account-results-title">
                    <h2 id="account-results-title">Tài khoản</h2>
                    {accountSearchLoading && <div className="search-status">Đang tìm tài khoản...</div>}
                    {accountSearchError && <div className="search-status error" role="alert">{accountSearchError}</div>}
                    {accountResults.map(user => (
                      <div key={user.id} className="search-result-item search-account-result">
                        <button className="search-account-profile" type="button"
                          onClick={() => { openProfile(user.id); setShowSearch(false); }}>
                          <span className="search-account-avatar">
                            {user.avatar
                              ? <img src={user.avatar} alt="" />
                              : getUserInitial(user)}
                          </span>
                          <span className="search-account-copy">
                            <strong>{getUserDisplayName(user)}</strong>
                            <small>{'@' + user.userName}</small>
                          </span>
                        </button>
                        <button className={'search-follow-button' + (user.followedByViewer ? ' following' : '')}
                          type="button" disabled={accountFollowPending[user.id]}
                          onClick={() => toggleSearchFollow(user)}>
                          {accountFollowPending[user.id]
                            ? '...'
                            : user.followedByViewer ? 'Đang theo dõi' : 'Theo dõi'}
                        </button>
                      </div>
                    ))}
                    {!accountSearchLoading && !accountSearchError && accountResults.length === 0 && (
                      <div className="search-status">Không có tài khoản phù hợp.</div>
                    )}
                  </section>

                  <section className="search-results-section" aria-labelledby="location-results-title">
                    <h2 id="location-results-title">Địa điểm</h2>
                    {locationSearchResults.map(location => (
                      <button key={location.id} className="search-result-item" onClick={() => goToDetail(location.id)}>
                        <div className="search-result-icon"><Icon name="marker" alt="" /></div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{location.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{location.address}</div>
                        </div>
                      </button>
                    ))}
                    {locationSearchResults.length === 0 && (
                      <div className="search-status">Không có địa điểm phù hợp.</div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
