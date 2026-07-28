import React, { useEffect, useState } from 'react';
import { CheckCircle2, Search, UserCheck, XCircle } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminReportsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: 'PENDING', targetType: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    adminApi.getReports({ page, size: 20, ...filters, status: filters.status || undefined, targetType: filters.targetType || undefined })
      .then(data => active && setResult(data)).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const replace = updated => setResult(previous => ({ ...previous, content: previous.content.map(item => item.id === updated.id ? updated : item) }));
  const act = async (report, action) => {
    setBusy(report.id);
    try {
      if (action === 'assign') replace(await adminApi.assignReport(report.id));
      else {
        const note = window.prompt(`Ghi chú ${action === 'resolve' ? 'xử lý' : 'từ chối'} báo cáo:`)?.trim();
        if (!note) return;
        if (action === 'resolve') {
          const suggested = report.targetType === 'USER' ? 'BAN'
            : ['POST', 'COMMENT', 'LOCATION'].includes(report.targetType) ? 'HIDE' : 'NONE';
          const resolutionAction = window.prompt('Biện pháp (NONE, HIDE, DELETE, BAN):', suggested)?.trim().toUpperCase();
          if (!['NONE', 'HIDE', 'DELETE', 'BAN'].includes(resolutionAction)) return;
          replace(await adminApi.resolveReport(report.id, note, resolutionAction));
        } else {
          replace(await adminApi.rejectReport(report.id, note));
        }
      }
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>TRUST & SAFETY</span><h1>Báo cáo vi phạm</h1><p>Nhận, xem xét và đóng báo cáo của cộng đồng.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() })); }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ID đối tượng, người báo cáo, mô tả" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {['', 'PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED', 'APPEALED'].map(value => <option value={value} key={value || 'all'}>{value || 'Mọi trạng thái'}</option>)}
      </select>
      <select value={filters.targetType} onChange={event => { setPage(0); setFilters(current => ({ ...current, targetType: event.target.value })); }}>
        {['', 'USER', 'POST', 'COMMENT', 'LOCATION', 'REVIEW', 'MEDIA'].map(value => <option value={value} key={value || 'all'}>{value || 'Mọi đối tượng'}</option>)}
      </select><button className="admin-primary-button" type="submit">Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không có báo cáo trong hàng đợi này.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Báo cáo</th><th>Đối tượng</th><th>Lý do</th><th>Trạng thái</th><th>Phụ trách</th><th>Thao tác</th></tr></thead>
      <tbody>{result.content.map(report => <tr key={report.id}>
        <td><strong>{report.reporterUserName}</strong><small>{report.description || new Date(report.createdAt).toLocaleString('vi-VN')}</small></td>
        <td>{report.targetType}<small>{report.targetId}</small></td><td>{report.reason}</td>
        <td><span className={`admin-badge ${report.status === 'RESOLVED' ? 'success' : report.status === 'PENDING' ? 'warning' : 'danger'}`}>{report.status}</span></td>
        <td>{report.assignedAdminUserName || 'Chưa nhận'}</td>
        <td><div className="admin-row-actions">
          {report.status === 'PENDING' && <button disabled={busy === report.id} onClick={() => act(report, 'assign')}><UserCheck size={14} /> Nhận</button>}
          {['PENDING', 'REVIEWING', 'APPEALED'].includes(report.status) && <>
            <button disabled={busy === report.id} onClick={() => act(report, 'resolve')}><CheckCircle2 size={14} /> Xử lý</button>
            <button disabled={busy === report.id} onClick={() => act(report, 'reject')}><XCircle size={14} /> Từ chối</button>
          </>}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
