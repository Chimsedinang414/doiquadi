import React, { useEffect, useState } from 'react';
import Icon from '../styles/icon';
import { api } from '../services/api';

const initialForm = {
  title: '',
  content: '',
  locationId: '',
  imageUrl: '',
  tags: '',
  rating: 0,
};

export default function CreatePostModal({ currentUser, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(() => setLocations([]));
    const closeOnEscape = event => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('social-modal-open');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('social-modal-open');
    };
  }, [onClose]);

  const update = event => {
    const { name, value } = event.target;
    setForm(previous => ({ ...previous, [name]: value }));
    if (name === 'imageUrl') setImageError(false);
  };

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const created = await api.createPost({
        userId: currentUser.id,
        locationId: form.locationId || null,
        title: form.title.trim(),
        content: form.content.trim() || null,
        rating: Number(form.rating) || null,
        imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        tags: form.tags.split(/[#,\s]+/).map(tag => tag.trim()).filter(Boolean),
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-post-overlay" role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="create-post-modal" role="dialog" aria-modal="true" aria-labelledby="create-post-title">
        <header className="create-post-header">
          <button type="button" className="create-post-close" onClick={onClose} aria-label="Đóng">✕</button>
          <h2 id="create-post-title">Tạo bài viết mới</h2>
          <button type="submit" form="create-post-form" className="create-post-submit"
            disabled={submitting || !form.title.trim()}>
            {submitting ? 'Đang đăng...' : 'Chia sẻ'}
          </button>
        </header>

        <form id="create-post-form" className="create-post-layout" onSubmit={submit}>
          <div className="create-post-preview">
            {form.imageUrl.trim() && !imageError ? (
              <img src={form.imageUrl.trim()} alt="Xem trước bài viết" onError={() => setImageError(true)} />
            ) : (
              <div className="create-post-empty-preview">
                <Icon name="picture" alt="" />
                <strong>Thêm ảnh món ngon của bạn</strong>
                <span>Dán đường dẫn ảnh ở phần nội dung</span>
              </div>
            )}
          </div>

          <div className="create-post-fields">
            <div className="create-post-author">
              <span className="create-post-avatar">
                {currentUser.avatar
                  ? <img src={currentUser.avatar} alt="" />
                  : currentUser.userName?.[0]?.toUpperCase()}
              </span>
              <strong>{currentUser.userName}</strong>
            </div>

            {error && <div className="create-post-error" role="alert">{error}</div>}

            <label className="create-post-field">
              <span>Tiêu đề</span>
              <input name="title" value={form.title} onChange={update} maxLength={255}
                placeholder="Bạn muốn chia sẻ món gì?" required autoFocus />
            </label>

            <label className="create-post-field">
              <span>Nội dung</span>
              <textarea name="content" value={form.content} onChange={update} maxLength={2000}
                placeholder="Kể về trải nghiệm, hương vị và điều bạn yêu thích..." />
              <small>{form.content.length}/2000</small>
            </label>

            <label className="create-post-field icon-field">
              <Icon name="marker" alt="" />
              <select name="locationId" value={form.locationId} onChange={update}>
                <option value="">Không gắn địa điểm</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>{location.name}</option>
                ))}
              </select>
            </label>

            <label className="create-post-field icon-field">
              <Icon name="link" alt="" />
              <input name="imageUrl" type="url" value={form.imageUrl} onChange={update}
                placeholder="https://... đường dẫn ảnh" />
            </label>

            <label className="create-post-field">
              <span>Hashtag</span>
              <input name="tags" value={form.tags} onChange={update}
                placeholder="#pho #hanoi #monngon" />
            </label>

            <fieldset className="create-post-rating">
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
