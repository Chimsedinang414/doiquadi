import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminAuditPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getAuditLogs({ page, size: 25 })
      .then(data => active && setResult(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [page, version]);

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>SECURITY LOG</span><h1>Nhật ký quản trị</h1><p>Lịch sử bất biến của các thao tác nhạy cảm.</p></div></div>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Chưa phát sinh thao tác quản trị.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Thời gian</th><th>Admin</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
      <tbody>{result.content.map(log => <tr key={log.id}>
        <td>{new Date(log.createdAt).toLocaleString('vi-VN')}</td><td>{log.actorUserName}</td>
        <td><span className="admin-audit-action">{log.action}</span></td><td>{log.targetType}<small>{log.targetId || '—'}</small></td><td>{log.details || '—'}</td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
