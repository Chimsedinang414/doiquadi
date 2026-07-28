import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import AdminPagination from '../components/AdminPagination';
import { AdminEmpty, AdminError, AdminLoading } from '../components/AdminState';

export default function AdminPostsPage() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setError('');
    adminApi.getPosts({ page, size: 20 })
      .then(data => active && setResult(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [page, version]);

  const remove = async post => {
    if (!window.confirm(`Xóa vĩnh viễn bài viết “${post.title}”?`)) return;
    setBusy(post.id);
    setError('');
    try {
      await adminApi.deletePost(post.id);
      setResult(previous => ({ ...previous, content: previous.content.filter(item => item.id !== post.id), totalElements: previous.totalElements - 1 }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  return <section className="admin-page">
    <div className="admin-page-heading"><div><span>MODERATION</span><h1>Bài viết</h1><p>Kiểm duyệt nội dung do cộng đồng đăng tải.</p></div></div>
    {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
    {!result && !error && <AdminLoading />}
    {result?.content.length === 0 && <AdminEmpty>Chưa có bài viết.</AdminEmpty>}
    {result?.content.length > 0 && <div className="admin-table-wrap"><table className="admin-table">
      <thead><tr><th>Bài viết</th><th>Tác giả</th><th>Địa điểm</th><th>Rating</th><th>Ngày tạo</th><th></th></tr></thead>
      <tbody>{result.content.map(post => <tr key={post.id}>
        <td><strong>{post.title}</strong><small>ID: {post.id}</small></td><td>{post.authorUserName}</td><td>{post.locationName || '—'}</td>
        <td>{post.rating ?? '—'}</td><td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
        <td><button className="admin-danger-button" type="button" disabled={busy === post.id} onClick={() => remove(post)}><Trash2 size={15} /> Xóa</button></td>
      </tr>)}</tbody>
    </table></div>}
    {result && <AdminPagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />}
  </section>;
}
