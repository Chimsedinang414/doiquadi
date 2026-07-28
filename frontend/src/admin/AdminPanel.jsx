import React, { useEffect, useState } from 'react';
import AdminLayout from './layout/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import AdminAuditPage from './pages/AdminAuditPage';

const SECTIONS = new Set(['dashboard', 'users', 'posts', 'locations', 'audit']);

function initialSection() {
  const candidate = window.location.pathname.split('/')[2];
  return SECTIONS.has(candidate) ? candidate : 'dashboard';
}

export default function AdminPanel({ user, onExit }) {
  const [section, setSection] = useState(initialSection);
  useEffect(() => {
    const handlePopState = () => setSection(initialSection());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const changeSection = next => {
    window.history.pushState({}, document.title, next === 'dashboard' ? '/admin' : `/admin/${next}`);
    setSection(next);
  };
  const pages = {
    dashboard: <AdminDashboardPage user={user} />,
    users: <AdminUsersPage currentUser={user} />,
    posts: <AdminPostsPage />,
    locations: <AdminLocationsPage />,
    audit: <AdminAuditPage />,
  };
  return <AdminLayout section={section} onSectionChange={changeSection} user={user} onExit={onExit}>
    {pages[section]}
  </AdminLayout>;
}
