import React, { useEffect, useState } from 'react';
import AdminLayout from './layout/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminCommentsPage from './pages/AdminCommentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import AdminDishesPage from './pages/AdminDishesPage';
import AdminAuditPage from './pages/AdminAuditPage';

const SECTIONS = new Set(['dashboard', 'users', 'posts', 'comments', 'reports', 'locations', 'dishes', 'audit']);

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
  const changeSection = (next, filters = {}) => {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const path = next === 'dashboard' ? '/admin' : `/admin/${next}`;
    const search = query.toString();
    window.history.pushState({}, document.title, search ? `${path}?${search}` : path);
    setSection(next);
  };
  const pages = {
    dashboard: <AdminDashboardPage user={user} onNavigate={changeSection} />,
    users: <AdminUsersPage currentUser={user} />,
    posts: <AdminPostsPage />,
    comments: <AdminCommentsPage />,
    reports: <AdminReportsPage />,
    locations: <AdminLocationsPage />,
    dishes: <AdminDishesPage />,
    audit: <AdminAuditPage />,
  };
  return <AdminLayout section={section} onSectionChange={changeSection} user={user} onExit={onExit}>
    {pages[section]}
  </AdminLayout>;
}
