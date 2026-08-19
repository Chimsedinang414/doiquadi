import React, { useEffect, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

const STATES = ['', 'PENDING', 'VERIFIED', 'REJECTED', 'TEMPORARILY_CLOSED', 'PERMANENTLY_CLOSED'];

function initialLocationFilters() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  return {
    query: params.get('query') || '',
    status: STATES.includes(status) ? status : 'PENDING',
  };
}

export default function AdminLocationsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(() => initialLocationFilters().query);
  const [filters, setFilters] = useState(initialLocationFilters);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    adminApi.getLocations({ page, size: 20, ...filters, status: filters.status || undefined })
      .then(data => active && setResult(data)).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const act = async (location, status) => {
    const reason = window.prompt(`Lý do chuyển địa điểm sang ${status}:`)?.trim();
    if (!reason) return;
    setBusy(location.id);
    try {
      const updated = status === 'VERIFIED' ? await adminApi.approveLocation(location.id, reason)
        : status === 'REJECTED' ? await adminApi.rejectLocation(location.id, reason)
          : await adminApi.updateLocationStatus(location.id, status, reason);
      setResult(previous => ({ ...previous, content: previous.content.map(item => item.id === updated.id ? updated : item) }));
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>LOCATION REVIEW</span><h1>Địa điểm</h1><p>Duyệt thông tin, tọa độ và trạng thái hoạt động.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() })); }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tên, địa chỉ hoặc ID" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {STATES.map(value => <option value={value} key={value || 'all'}>{value || 'Mọi trạng thái'}</option>)}
      </select><button className="admin-primary-button" type="submit">Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không có địa điểm phù hợp.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Địa điểm</th><th>Địa chỉ</th><th>Tọa độ</th><th>Trạng thái</th><th>Báo cáo</th><th>Thao tác</th></tr></thead>
      <tbody>{result.content.map(location => <tr key={location.id}>
        <td><strong>{location.name}</strong><small>{location.phone || location.id}</small></td><td>{location.address || '—'}</td>
        <td>{location.latitude == null ? '—' : `${location.latitude}, ${location.longitude}`}</td>
        <td><span className={`admin-badge ${location.status === 'VERIFIED' ? 'success' : location.status === 'PENDING' ? 'warning' : 'danger'}`}>{location.status}</span><small>{location.moderationReason || ''}</small></td>
        <td>{location.reportCount}</td><td><div className="admin-row-actions">
          {location.status !== 'VERIFIED' && <button disabled={busy === location.id} onClick={() => act(location, 'VERIFIED')}><Check size={14} /> Duyệt</button>}
          {location.status !== 'REJECTED' && <button disabled={busy === location.id} onClick={() => act(location, 'REJECTED')}><X size={14} /> Từ chối</button>}
          <select value={location.status} disabled={busy === location.id} onChange={event => act(location, event.target.value)}>{STATES.filter(Boolean).map(state => <option key={state}>{state}</option>)}</select>
        </div></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
