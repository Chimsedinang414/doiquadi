import React, { useEffect, useState } from 'react';
import { Ban, Clock3, KeyRound, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { getUserDisplayName } from '../../utils/userDisplay';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

const STATUSES = ['', 'ACTIVE', 'WARNING', 'SUSPENDED', 'BANNED', 'DELETED'];
const ROLES = ['USER', 'SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'LOCATION_MODERATOR', 'SUPPORT', 'ANALYST'];

function askReason(label) {
  const value = window.prompt(`Lý do ${label}:`);
  return value?.trim() || '';
}

export default function AdminUsersPage({ currentUser }) {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: '', role: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getUsers({ page, size: 20, ...filters, status: filters.status || undefined, role: filters.role || undefined })
      .then(data => active && setResult(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const replaceUser = updated => setResult(previous => ({
    ...previous,
    content: previous.content.map(user => user.id === updated.id ? updated : user),
  }));

  const act = async (user, action) => {
    const labels = { warn: 'cảnh báo', suspend: 'tạm khóa', ban: 'khóa vĩnh viễn', unban: 'mở khóa' };
    const reason = askReason(`${labels[action]} tài khoản ${user.userName}`);
    if (!reason) return;
    setBusy(`${action}-${user.id}`);
    setError('');
    try {
      let updated;
      if (action === 'warn') updated = await adminApi.warnUser(user.id, reason);
      if (action === 'ban') updated = await adminApi.banUser(user.id, reason);
      if (action === 'unban') updated = await adminApi.unbanUser(user.id, reason);
      if (action === 'suspend') {
        const defaultUntil = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
        const until = window.prompt('Tạm khóa đến thời điểm nào? (YYYY-MM-DDTHH:mm)', defaultUntil);
        if (!until) return;
        updated = await adminApi.suspendUser(user.id, reason, until.length === 16 ? `${until}:00` : until);
      }
      replaceUser(updated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  const changeRoles = async user => {
    const raw = window.prompt(
      `Nhập các role, cách nhau bằng dấu phẩy:\\n${ROLES.join(', ')}`,
      user.roles.join(', '));
    if (!raw) return;
    const roles = [...new Set(raw.split(',').map(role => role.trim().toUpperCase()).filter(role => ROLES.includes(role)))];
    if (roles.length === 0) return;
    setBusy(`roles-${user.id}`);
    try {
      replaceUser(await adminApi.updateUserRoles(user.id, roles));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>ACCESS CONTROL</span><h1>Người dùng</h1><p>Cảnh báo, tạm khóa, khóa vĩnh viễn và phân quyền.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => {
      event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() }));
    }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ID, username, họ tên hoặc email" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {STATUSES.map(status => <option value={status} key={status || 'all'}>{status || 'Mọi trạng thái'}</option>)}
      </select>
      <select value={filters.role} onChange={event => { setPage(0); setFilters(current => ({ ...current, role: event.target.value })); }}>
        {['', ...ROLES].map(role => <option value={role} key={role || 'all'}>{role || 'Mọi vai trò'}</option>)}
      </select>
      <button className="admin-primary-button" type="submit"><Search size={16} /> Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không tìm thấy người dùng phù hợp.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Tài khoản</th><th>Trạng thái</th><th>Role</th><th>Hoạt động</th><th>Thao tác</th></tr></thead>
      <tbody>{result.content.map(user => {
        const self = user.id === currentUser?.id;
        return <tr key={user.id}>
          <td><strong>{getUserDisplayName(user)}</strong><small>@{user.userName} · {user.email}</small></td>
          <td><span className={`admin-badge ${user.status === 'ACTIVE' ? 'success' : user.status === 'WARNING' ? 'warning' : 'danger'}`}>{user.status}</span><small>{user.moderationReason || ''}</small></td>
          <td>{user.roles.map(role => <span className="admin-role" key={role}>{role}</span>)}</td>
          <td><strong>{user.postsCount} bài</strong><small>{user.followersCount} follower · {user.followingCount} following</small></td>
          <td><div className="admin-row-actions admin-row-actions-wrap">
            <button type="button" disabled={self || Boolean(busy)} onClick={() => act(user, 'warn')}><ShieldAlert size={14} /> Cảnh báo</button>
            <button type="button" disabled={self || Boolean(busy)} onClick={() => act(user, 'suspend')}><Clock3 size={14} /> Tạm khóa</button>
            {user.status === 'BANNED'
              ? <button type="button" disabled={self || Boolean(busy)} onClick={() => act(user, 'unban')}><RotateCcw size={14} /> Mở khóa</button>
              : <button type="button" disabled={self || Boolean(busy)} onClick={() => act(user, 'ban')}><Ban size={14} /> Khóa</button>}
            {isSuperAdmin && <button type="button" disabled={self || Boolean(busy)} onClick={() => changeRoles(user)}><KeyRound size={14} /> Phân quyền</button>}
          </div></td>
        </tr>;
      })}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
