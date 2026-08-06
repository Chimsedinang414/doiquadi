import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, FileText, RotateCcw, Search, Trash2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';
import AdminTargetPreviewModal from '../components/AdminTargetPreviewModal';

const STATUSES = ['', 'ACTIVE', 'UNDER_REVIEW', 'HIDDEN', 'DELETED'];

function initialCommentFilters() {
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status');
  return {
    query: params.get('query') || '',
    status: STATUSES.includes(status) ? status : '',
  };
}

export default function AdminCommentsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState(() => initialCommentFilters().query);
  const [filters, setFilters] = useState(initialCommentFilters);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);
  const [previewTarget, setPreviewTarget] = useState(null);

  useEffect(() => {
    let active = true;
    adminApi.getComments({ page, size: 20, query: filters.query, status: filters.status || undefined })
      .then(data => active && setResult(data)).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const act = async (comment, action) => {
    const reason = window.prompt(`Lý do ${action === 'hide' ? 'ẩn' : action === 'restore' ? 'khôi phục' : 'xóa'} bình luận:`)?.trim();
    if (!reason) return;
    setBusy(comment.id);
    try {
      const updated = action === 'hide' ? await adminApi.hideComment(comment.id, reason)
        : action === 'restore' ? await adminApi.restoreComment(comment.id, reason)
          : await adminApi.deleteComment(comment.id, reason);
      setResult(previous => ({ ...previous, content: previous.content.map(item => item.id === updated.id ? updated : item) }));
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>MODERATION</span><h1>Bình luận</h1><p>Xem ngữ cảnh, ẩn, xóa mềm và khôi phục bình luận.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() })); }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Nội dung hoặc người viết" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {STATUSES.map(value => <option value={value} key={value || 'all'}>{value || 'Mọi trạng thái'}</option>)}
      </select><button className="admin-primary-button" type="submit"><Search size={16} /> Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không có bình luận phù hợp.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Bình luận</th><th>Ngữ cảnh</th><th>Tác giả</th><th>Trạng thái</th><th>Báo cáo</th><th>Thao tác</th></tr></thead>
      <tbody>{result.content.map(comment => <tr key={comment.id}>
        <td><strong>{comment.content}</strong><small>{new Date(comment.createdAt).toLocaleString('vi-VN')}</small></td>
        <td>{comment.postTitle}<button type="button" className="admin-inline-link"
          onClick={() => setPreviewTarget({ targetType: 'POST', targetId: comment.postId })}>
          <FileText size={12} /> Post: {comment.postId}
        </button></td><td>{comment.authorUserName}</td>
        <td><span className={`admin-badge ${comment.status === 'ACTIVE' ? 'success' : 'danger'}`}>{comment.status}</span></td><td>{comment.reportCount}</td>
        <td><div className="admin-row-actions">
          <button type="button" onClick={() => setPreviewTarget({ targetType: 'COMMENT', targetId: comment.id })}><Eye size={14} /> Xem nhanh</button>
          {comment.status === 'ACTIVE' && <button disabled={busy === comment.id} onClick={() => act(comment, 'hide')}><EyeOff size={14} /> Ẩn</button>}
          {comment.status !== 'ACTIVE' && <button disabled={busy === comment.id} onClick={() => act(comment, 'restore')}><RotateCcw size={14} /> Khôi phục</button>}
          {comment.status !== 'DELETED' && <button disabled={busy === comment.id} onClick={() => act(comment, 'delete')}><Trash2 size={14} /> Xóa</button>}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
    {previewTarget && <AdminTargetPreviewModal {...previewTarget} onClose={() => setPreviewTarget(null)} />}
  </section>;
}
