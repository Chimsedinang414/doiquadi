import React, { useEffect, useState } from 'react';
import Icon from '../styles/icon';
import { api, getCurrentUser, getOAuthAuthorizationUrl } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

const oauthProviders = [
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook' },
];

const text = {
  title: 'C\u00e0i \u0111\u1eb7t',
  account: 'T\u00e0i kho\u1ea3n',
  profile: 'Xem trang c\u00e1 nh\u00e2n',
  connectedAccounts: 'T\u00e0i kho\u1ea3n \u0111\u0103ng nh\u1eadp',
  connectedAccountsHint: 'Ch\u1ec9 li\u00ean k\u1ebft sau khi b\u1ea1n \u0111\u00e3 \u0111\u0103ng nh\u1eadp LocalFood. Email t\u1eeb nh\u00e0 cung c\u1ea5p kh\u00f4ng \u0111\u01b0\u1ee3c d\u00f9ng \u0111\u1ec3 t\u1ef1 h\u1ee3p nh\u1ea5t t\u00e0i kho\u1ea3n.',
  connect: 'Li\u00ean k\u1ebft',
  connected: '\u0110\u00e3 li\u00ean k\u1ebft',
  linking: '\u0110ang chuy\u1ec3n h\u01b0\u1edbng\u2026',
  preferences: 'T\u00f9y ch\u1ecdn',
  privateLabel: 'T\u00e0i kho\u1ea3n ri\u00eang t\u01b0',
  privateHint: 'Ch\u1ec9 nh\u1eefng ng\u01b0\u1eddi b\u1ea1n ch\u1ea5p nh\u1eadn m\u1edbi xem \u0111\u01b0\u1ee3c n\u1ed9i dung.',
  notificationsLabel: 'Th\u00f4ng b\u00e1o ho\u1ea1t \u0111\u1ed9ng',
  notificationsHint: 'Nh\u1eadn th\u00f4ng b\u00e1o khi c\u00f3 l\u01b0\u1ee3t th\u00edch, b\u00ecnh lu\u1eadn ho\u1eb7c theo d\u00f5i m\u1edbi.',
  signedOut: 'B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 m\u1edf c\u00e0i \u0111\u1eb7t.',
  login: '\u0110\u0103ng nh\u1eadp',
};

export default function SettingsPage({ onProfileOpen, onAuthNavigate }) {
  const [user, setUser] = useState(getCurrentUser());
  const [privateAccount, setPrivateAccount] = useState(() => localStorage.getItem('localfoodPrivateAccount') === 'true');
  const [notifications, setNotifications] = useState(() => localStorage.getItem('localfoodNotifications') !== 'false');
  const [linkedProviders, setLinkedProviders] = useState(new Set());
  const [linkingProvider, setLinkingProvider] = useState('');
  const [linkError, setLinkError] = useState('');

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
    if (!user) return undefined;
    let active = true;
    api.getOAuthLinks()
      .then(result => {
        if (active) setLinkedProviders(new Set(result.linkedProviders || []));
      })
      .catch(error => {
        if (active) setLinkError(error.message);
      });
    return () => { active = false; };
  }, [user]);

  const changeSetting = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  const startOAuthLink = async provider => {
    setLinkError('');
    setLinkingProvider(provider);
    try {
      await api.startOAuthLink(provider);
      window.location.assign(getOAuthAuthorizationUrl(provider));
    } catch (error) {
      setLinkError(error.message);
      setLinkingProvider('');
    }
  };

  if (!user) return (
    <section className="settings-page settings-signed-out">
      <Icon name="settings" alt="" />
      <h1>{text.title}</h1>
      <p>{text.signedOut}</p>
      <button type="button" onClick={() => onAuthNavigate('login')}>{text.login}</button>
    </section>
  );

  return (
    <section className="settings-page">
      <header className="settings-header">
        <Icon name="settings" alt="" />
        <h1>{text.title}</h1>
      </header>
      <div className="settings-card">
        <h2>{text.account}</h2>
        <button className="settings-profile-link" type="button" onClick={() => onProfileOpen(user.id)}>
          <span className="settings-avatar">
            {user.avatar ? <img src={user.avatar} alt="" /> : getUserInitial(user)}
          </span>
          <span><strong>{getUserDisplayName(user)}</strong><small>{user.email}</small></span>
          <span className="settings-profile-cta">{text.profile} &rsaquo;</span>
        </button>
      </div>
      <div className="settings-card">
        <h2>{text.connectedAccounts}</h2>
        <p className="settings-security-hint">{text.connectedAccountsHint}</p>
        {linkError && <div className="settings-link-error" role="alert">{linkError}</div>}
        <div className="settings-provider-list">
          {oauthProviders.map(provider => {
            const connected = linkedProviders.has(provider.id);
            const linking = linkingProvider === provider.id;
            return (
              <div className="settings-provider-row" key={provider.id}>
                <span className="settings-provider-logo"><Icon name={provider.id} alt="" /></span>
                <span className="settings-provider-copy">
                  <strong>{provider.label}</strong>
                  <small>{connected ? text.connected : 'Ch\u01b0a li\u00ean k\u1ebft'}</small>
                </span>
                <button type="button" disabled={connected || Boolean(linkingProvider)}
                  onClick={() => startOAuthLink(provider.id)}>
                  {connected ? text.connected : linking ? text.linking : text.connect}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="settings-card">
        <h2>{text.preferences}</h2>
        <label className="settings-toggle-row">
          <span><strong>{text.privateLabel}</strong><small>{text.privateHint}</small></span>
          <input type="checkbox" checked={privateAccount}
            onChange={event => changeSetting('localfoodPrivateAccount', event.target.checked, setPrivateAccount)} />
        </label>
        <label className="settings-toggle-row">
          <span><strong>{text.notificationsLabel}</strong><small>{text.notificationsHint}</small></span>
          <input type="checkbox" checked={notifications}
            onChange={event => changeSetting('localfoodNotifications', event.target.checked, setNotifications)} />
        </label>
      </div>
    </section>
  );
}
