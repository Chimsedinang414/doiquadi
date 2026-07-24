import React, { useEffect, useState } from 'react';
import Icon from '../styles/icon';
import { getCurrentUser } from '../services/api';

const text = {
  title: 'C\u00e0i \u0111\u1eb7t',
  account: 'T\u00e0i kho\u1ea3n',
  profile: 'Xem trang c\u00e1 nh\u00e2n',
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

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const changeSetting = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, String(value));
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
            {user.avatar ? <img src={user.avatar} alt="" /> : user.userName?.[0]?.toUpperCase()}
          </span>
          <span><strong>{user.userName}</strong><small>{user.email}</small></span>
          <span className="settings-profile-cta">{text.profile} &rsaquo;</span>
        </button>
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

