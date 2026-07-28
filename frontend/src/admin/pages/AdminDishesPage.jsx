import React, { useEffect, useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminDishesPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    adminApi.getDishes({ page, size: 20, ...filters, status: filters.status || undefined })
      .then(data => active && setResult(data)).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const edit = async dish => {
    const name = window.prompt('Tên món ăn:', dish.name)?.trim();
    if (!name) return;
    const description = window.prompt('Mô tả:', dish.description || '') ?? dish.description;
    const status = window.prompt('Trạng thái (ACTIVE, HIDDEN, MERGED):', dish.status)?.trim().toUpperCase();
    if (!['ACTIVE', 'HIDDEN', 'MERGED'].includes(status)) return;
    const reason = window.prompt('Lý do cập nhật:')?.trim();
    if (!reason) return;
    setBusy(dish.id);
    try {
      const updated = await adminApi.updateDish(dish.id, { name, description, imageUrl: dish.imageUrl, status, reason });
      setResult(previous => ({ ...previous, content: previous.content.map(item => item.id === updated.id ? updated : item) }));
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>CATALOG</span><h1>Món ăn</h1><p>Chuẩn hóa tên, mô tả, ảnh và trạng thái món ăn.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() })); }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tên, mô tả hoặc ID món" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {['', 'ACTIVE', 'HIDDEN', 'MERGED'].map(value => <option value={value} key={value || 'all'}>{value || 'Mọi trạng thái'}</option>)}
      </select><button className="admin-primary-button" type="submit">Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không có món ăn phù hợp.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Món ăn</th><th>Mô tả</th><th>Trạng thái</th><th>Báo cáo</th><th></th></tr></thead>
      <tbody>{result.content.map(dish => <tr key={dish.id}>
        <td><strong>{dish.name}</strong><small>{dish.id}</small></td><td>{dish.description || '—'}</td>
        <td><span className={`admin-badge ${dish.status === 'ACTIVE' ? 'success' : 'danger'}`}>{dish.status}</span><small>{dish.moderationReason || ''}</small></td>
        <td>{dish.reportCount}</td><td><button className="admin-secondary-button" disabled={busy === dish.id} onClick={() => edit(dish)}><Pencil size={14} /> Sửa</button></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
