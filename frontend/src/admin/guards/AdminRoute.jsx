import React from 'react';

export default function AdminRoute({ user, onBack, children }) {
  if (user?.roles?.includes('ADMIN')) return children;

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
