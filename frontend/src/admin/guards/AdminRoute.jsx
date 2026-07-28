import React from 'react';

export default function AdminRoute({ user, onBack, children }) {
  const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'LOCATION_MODERATOR', 'SUPPORT', 'ANALYST'];
  if (user?.roles?.some(role => adminRoles.includes(role))) return children;

  return (
    <main className="admin-access-page">
      <section className="admin-access-card">
        <span className="admin-access-code">403</span>
        <h1>Không có quyền truy cập</h1>
        <p>Khu vực này chỉ dành cho tài khoản quản trị đang hoạt động.</p>
        <button type="button" className="admin-primary-button" onClick={onBack}>Quay về LocalFood</button>
      </section>
    </main>
  );
}
