import React, { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  MapPinned,
  Newspaper,
  RefreshCw,
  ShieldCheck,
  Flag,
  MessageSquare,
  UserCheck,
  Users,
} from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminError, AdminLoading } from '../components/AdminState';
import { getUserDisplayName } from '../../utils/userDisplay';

const METRICS = [
  ['users', 'Tổng người dùng', Users, 'Toàn hệ thống'],
  ['activeUsers', 'Đang hoạt động', UserCheck, 'Hiện tại'],
  ['posts', 'Bài viết', Newspaper, 'Đang hiển thị'],
  ['comments', 'Bình luận', MessageSquare, 'Đang hiển thị'],
  ['locations', 'Địa điểm', MapPinned, 'Đã xác minh'],
  ['pendingReports', 'Báo cáo chờ xử lý', Flag, 'Cần xử lý'],
];

export default function AdminDashboardPage({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    Promise.all([adminApi.getDashboard(), adminApi.getGrowth()])
      .then(([summary, growth]) => active && setData({ summary, growth }))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [version]);

  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  const summary = data?.summary;
  const activeRate = summary?.users ? Math.round((summary.activeUsers / summary.users) * 100) : 0;
  const maxActivity = Math.max(1, ...(data?.growth || []).map(point => point.users + point.posts + point.comments));

  return (
    <section className="admin-page admin-dashboard-page">
      <div className="admin-page-heading admin-welcome-heading">
        <div>
          <span>ADMIN DASHBOARD</span>
          <h1>Chào mừng trở lại, {getUserDisplayName(user, 'Admin')}</h1>
          <p>Đây là tổng quan hoạt động mới nhất của cộng đồng LocalFood.</p>
        </div>
        <div className="admin-date-chip"><CalendarDays size={18} /><span>{today}</span></div>
      </div>

      <div className="admin-dashboard-tabs">
        <button type="button" className="active">Tổng quan</button>
        <button type="button">Phân tích</button>
        <button type="button">Vận hành</button>
        <button type="button" className="admin-refresh-button" onClick={() => setVersion(value => value + 1)}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {!data && !error && <AdminLoading />}
      {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
      {data && <>
        <div className="admin-metric-grid">
          {METRICS.map(([key, label, MetricIcon, trend]) => (
            <article className="admin-metric-card" key={key}>
              <div className="admin-metric-icon"><MetricIcon size={20} strokeWidth={1.8} /></div>
              <span className="admin-metric-trend">{trend}</span>
              <strong>{Number(summary[key] || 0).toLocaleString('vi-VN')}</strong>
              <p>{label}</p>
            </article>
          ))}
        </div>

        <div className="admin-analytics-grid">
          <article className="admin-panel admin-audience-panel">
            <header>
              <div><Activity size={19} /><strong>Hoạt động cộng đồng</strong></div>
              <span>12 kỳ gần nhất</span>
            </header>
            <div className="admin-chart-legend">
              <span><i className="direct" />Người dùng</span>
              <span><i className="organic" />Nội dung</span>
              <span><i className="referral" />Địa điểm</span>
            </div>
            <div className="admin-bar-chart" aria-label="Biểu đồ hoạt động cộng đồng">
              {data.growth.map((point, index) => (
                <div className="admin-bar-column" key={point.date} title={`${point.date}: ${point.users} user, ${point.posts} bài, ${point.comments} bình luận`}>
                  <div className="admin-bar" style={{ '--bar-height': `${Math.max(8, ((point.users + point.posts + point.comments) / maxActivity) * 100)}%` }}>
                    <i /><i /><i />
                  </div>
                  <span>{index % 2 === 0 ? point.date.slice(5) : ''}</span>
                </div>
              ))}
            </div>
            <footer>
              <div><span>Admin</span><strong>{summary.administrators}</strong></div>
              <div><span>Audit events</span><strong>{Number(summary.auditEvents).toLocaleString('vi-VN')}</strong></div>
              <div><span>Tỷ lệ hoạt động</span><strong>{activeRate}%</strong></div>
            </footer>
          </article>

          <article className="admin-panel admin-health-panel">
            <header><div><ShieldCheck size={19} /><strong>Sức khỏe hệ thống</strong></div><span>Live</span></header>
            <div className="admin-health-ring" style={{ '--health': `${Math.max(activeRate, 3) * 3.6}deg` }}>
              <div><strong>{activeRate}%</strong><span>Active</span></div>
            </div>
            <div className="admin-health-list">
              <p><span><i className="teal" />Phân quyền</span><strong>Ổn định</strong></p>
              <p><span><i className="green" />Database</span><strong>Đã kết nối</strong></p>
              <p><span><i className="blue" />Audit</span><strong>{summary.auditEvents} sự kiện</strong></p>
            </div>
          </article>
        </div>
      </>}
    </section>
  );
}
