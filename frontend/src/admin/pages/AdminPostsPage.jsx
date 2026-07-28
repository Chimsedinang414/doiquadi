import React, { useEffect, useState } from 'react';
import { EyeOff, RotateCcw, Search, Trash2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

const STATUSES = ['', 'ACTIVE', 'UNDER_REVIEW', 'HIDDEN', 'DELETED'];

export default function AdminPostsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ query: '', status: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getPosts({ page, size: 20, query: filters.query, status: filters.status || undefined })
      .then(data => active && setResult(data)).catch(err => active && setError(err.message));
    return () => { active = false; };
  }, [page, filters, version]);

  const act = async (post, action) => {
    const reason = window.prompt(`Lý do ${action === 'hide' ? 'ẩn' : action === 'restore' ? 'khôi phục' : 'xóa'} bài viết:`)?.trim();
    if (!reason) return;
    setBusy(post.id);
    try {
      const updated = action === 'hide' ? await adminApi.hidePost(post.id, reason)
        : action === 'restore' ? await adminApi.restorePost(post.id, reason)
          : await adminApi.deletePost(post.id, reason);
      setResult(previous => ({ ...previous, content: previous.content.map(item => item.id === updated.id ? updated : item) }));
    } catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>MODERATION</span><h1>Bài viết</h1><p>Ẩn, xóa mềm và khôi phục nội dung cộng đồng.</p></div></div>
    <form className="admin-toolbar admin-filter-toolbar" onSubmit={event => { event.preventDefault(); setPage(0); setFilters(current => ({ ...current, query: search.trim() })); }}>
      <label><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tiêu đề, nội dung hoặc tác giả" /></label>
      <select value={filters.status} onChange={event => { setPage(0); setFilters(current => ({ ...current, status: event.target.value })); }}>
        {STATUSES.map(status => <option value={status} key={status || 'all'}>{status || 'Mọi trạng thái'}</option>)}
      </select><button className="admin-primary-button" type="submit"><Search size={16} /> Tìm</button>
    </form>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Không có bài viết phù hợp.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Bài viết</th><th>Tác giả</th><th>Trạng thái</th><th>Báo cáo</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
      <tbody>{result.content.map(post => <tr key={post.id}>
        <td><strong>{post.title}</strong><small>{post.content || `ID: ${post.id}`}</small></td><td>{post.authorUserName}</td>
        <td><span className={`admin-badge ${post.status === 'ACTIVE' ? 'success' : 'danger'}`}>{post.status}</span><small>{post.moderationReason || ''}</small></td>
        <td>{post.reportCount}</td><td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
        <td><div className="admin-row-actions">
          {post.status === 'ACTIVE' && <button disabled={busy === post.id} onClick={() => act(post, 'hide')}><EyeOff size={14} /> Ẩn</button>}
          {post.status !== 'ACTIVE' && <button disabled={busy === post.id} onClick={() => act(post, 'restore')}><RotateCcw size={14} /> Khôi phục</button>}
          {post.status !== 'DELETED' && <button disabled={busy === post.id} onClick={() => act(post, 'delete')}><Trash2 size={14} /> Xóa</button>}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
