import React, { useEffect, useState } from 'react';
import Icon from '../styles/icon';
import { api } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

export default function EditPostModal({ currentUser, post, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title: post.title || post.restaurantName || '',
    content: post.description || post.content || '',
    locationId: post.locationId || '',
    tags: (post.tags || []).join(' '),
    rating: post.rating || 0,
  });
  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => setLocations([]));
    const closeOnEscape = event => event.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('social-modal-open');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('social-modal-open');
    };
  }, [onClose, submitting]);

  const update = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
  };

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const updated = await api.updatePost(post.id, {
        userId: currentUser.id,
        locationId: form.locationId || null,
        title: form.title.trim(),
        content: form.content.trim() || null,
        rating: Number(form.rating) || null,
        tags: form.tags.split(/[#,\s]+/).map(tag => tag.trim()).filter(Boolean),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-overlay" role="presentation"
      onMouseDown={event => event.target === event.currentTarget && !submitting && onClose()}>
      <section className="create-post-modal" role="dialog" aria-modal="true" aria-labelledby="edit-post-title">
        <header className="create-post-header">
          <button type="button" className="create-post-close" onClick={onClose}
            disabled={submitting} aria-label="Đóng">✕</button>
          <h2 id="edit-post-title">Chỉnh sửa bài viết</h2>
          <button type="submit" form="edit-post-form" className="create-post-submit"
            disabled={submitting || !form.title.trim()}>
            {submitting ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </header>

        <form id="edit-post-form" className="create-post-layout" onSubmit={submit}>
          <div className="create-post-fields" style={{ width: '100%', minWidth: '400px' }}>
            <div className="create-post-author">
              <span className="create-post-avatar">
                {currentUser.avatar
                  ? <img src={currentUser.avatar} alt="" />
                  : getUserInitial(currentUser)}
              </span>
              <strong>{getUserDisplayName(currentUser)}</strong>
            </div>

            {error && <div className="create-post-error" role="alert">{error}</div>}

            <label className="create-post-field">
              <span>Tiêu đề</span>
              <input name="title" value={form.title} onChange={update} maxLength={255}
                placeholder="Bạn muốn chia sẻ món gì?" required autoFocus disabled={submitting} />
            </label>

            <label className="create-post-field">
              <span>Nội dung</span>
              <textarea name="content" value={form.content} onChange={update} maxLength={2000}
                placeholder="Kể về trải nghiệm, hương vị và điều bạn yêu thích..."
                disabled={submitting} style={{ minHeight: '150px' }} />
              <small>{form.content.length}/2000</small>
            </label>

            <label className="create-post-field icon-field">
              <Icon name="marker" alt="" />
              <select name="locationId" value={form.locationId} onChange={update} disabled={submitting}>
                <option value="">Không gắn địa điểm</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>

            <label className="create-post-field">
              <span>Hashtag</span>
              <input name="tags" value={form.tags} onChange={update}
                placeholder="#pho #hanoi #monngon" disabled={submitting} />
            </label>

            <fieldset className="create-post-rating" disabled={submitting}>
              <legend>Đánh giá</legend>
              <div>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" className={star <= Number(form.rating) ? 'active' : ''}
                    onClick={() => setForm(previous => ({ ...previous, rating: star }))}
                    aria-label={`${star} sao`}>★</button>
                ))}
                {form.rating > 0 && (
                  <button type="button" className="clear-rating"
                    onClick={() => setForm(previous => ({ ...previous, rating: 0 }))}>Xóa</button>
                )}
              </div>
            </fieldset>
          </div>
        </form>
      </section>
    </div>
  );
}
