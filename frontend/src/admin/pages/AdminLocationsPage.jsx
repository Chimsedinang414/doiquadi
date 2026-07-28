import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminLocationsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getLocations({ page, size: 20 })
      .then(data => active && setResult(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [page, version]);

  const remove = async location => {
    if (!window.confirm(`Xóa địa điểm “${location.name}” và dữ liệu liên quan?`)) return;
    setBusy(location.id);
    setError('');
    try {
      await adminApi.deleteLocation(location.id);
      setResult(previous => ({ ...previous, content: previous.content.filter(item => item.id !== location.id), totalElements: previous.totalElements - 1 }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>CATALOG</span><h1>Địa điểm</h1><p>Quản lý danh mục quán ăn và địa điểm.</p></div></div>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Chưa có địa điểm.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Địa điểm</th><th>Địa chỉ</th><th>Điện thoại</th><th>Giá trung bình</th><th></th></tr></thead>
      <tbody>{result.content.map(location => <tr key={location.id}>
        <td><strong>{location.name}</strong><small>ID: {location.id}</small></td><td>{location.address || '—'}</td><td>{location.phone || '—'}</td>
        <td>{location.averagePrice == null ? '—' : Number(location.averagePrice).toLocaleString('vi-VN') + ' ₫'}</td>
        <td><button className="admin-danger-button" type="button" disabled={busy === location.id} onClick={() => remove(location)}><Trash2 size={15} /> Xóa</button></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
