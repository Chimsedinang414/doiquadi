import React, { useEffect, useState } from 'react';
import { Lock, Search, ShieldMinus, ShieldPlus, Unlock } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminUsersPage({ currentUser }) {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getUsers({ page, size: 20, query })
      .then(data => active && setResult(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [page, query, version]);

  const replaceUser = updated => setResult(previous => ({
    ...previous,
    content: previous.content.map(user => user.id === updated.id ? updated : user),
  }));

  const changeStatus = async user => {
    if (!window.confirm(`${user.enabled ? 'Khóa' : 'Mở khóa'} tài khoản ${user.userName}?`)) return;
    setBusy(`status-${user.id}`);
    setError('');
    try {
      replaceUser(await adminApi.updateUserStatus(user.id, !user.enabled));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  const changeRole = async user => {
    const isAdmin = user.roles.includes('ADMIN');
    if (!window.confirm(`${isAdmin ? 'Gỡ' : 'Cấp'} quyền admin cho ${user.userName}?`)) return;
    setBusy(`role-${user.id}`);
    setError('');
    try {
      replaceUser(await adminApi.updateAdminRole(user.id, !isAdmin));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div><span>ACCESS CONTROL</span><h1>Người dùng</h1><p>Khóa tài khoản và quản lý quyền quản trị.</p></div>
      </div>
      <form className="admin-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setQuery(search.trim()); }}>
        <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm email hoặc username" /></label>
        <button className="admin-primary-button" type="submit"><Search size={16} /> Tìm kiếm</button>
      </form>
      {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
      {!result && !error && <AdminLoading />}
      {result?.content.length === 0 && <AdminEmpty>Không tìm thấy người dùng phù hợp.</AdminEmpty>}
      {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Tài khoản</th><th>Trạng thái</th><th>Role</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
        <tbody>{result.content.map(user => {
          const self = user.id === currentUser?.id;
          const isAdmin = user.roles.includes('ADMIN');
          return <tr key={user.id}>
            <td><strong>{user.userName}</strong><small>{user.email}</small></td>
            <td><span className={`admin-badge ${user.enabled ? 'success' : 'danger'}`}>{user.enabled ? 'Hoạt động' : 'Đã khóa'}</span></td>
            <td>{user.roles.map(role => <span className="admin-role" key={role}>{role}</span>)}</td>
            <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
            <td><div className="admin-row-actions">
              <button type="button" disabled={self || busy === `status-${user.id}`} onClick={() => changeStatus(user)}>
                {user.enabled ? <Lock size={15} /> : <Unlock size={15} />}{user.enabled ? 'Khóa' : 'Mở'}
              </button>
              <button type="button" disabled={self || busy === `role-${user.id}`} onClick={() => changeRole(user)}>
                {isAdmin ? <ShieldMinus size={15} /> : <ShieldPlus size={15} />}{isAdmin ? 'Gỡ admin' : 'Cấp admin'}
              </button>
            </div></td>
          </tr>;
        })}</tbody>
      </table></div>}
      {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
    </section>
  );
}
