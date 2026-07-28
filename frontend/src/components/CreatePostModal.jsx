import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../styles/icon';
import { api, uploadImage } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const initialForm = {
  title: '',
  content: '',
  locationId: '',
  tags: '',
  rating: 0,
};

export default function CreatePostModal({ currentUser, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [locations, setLocations] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const previews = useMemo(
    () => selectedFiles.map(file => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  useEffect(() => () => previews.forEach(preview => URL.revokeObjectURL(preview.url)), [previews]);

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

  const selectFiles = files => {
    const candidates = Array.from(files || []);
    const invalid = candidates.find(file =>
      !ALLOWED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError('Chỉ hỗ trợ JPG, PNG, WEBP, GIF và tối đa 10MB mỗi ảnh');
      return;
    }
    setSelectedFiles(previous => [...previous, ...candidates].slice(0, MAX_IMAGES));
    setError('');
  };

  const removeFile = index => {
    setSelectedFiles(previous => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const uploadFiles = async () => {
    const uploaded = [];
    for (let index = 0; index < selectedFiles.length; index += 1) {
      const result = await uploadImage(selectedFiles[index], currentUser.id, progress => {
        const overall = ((index + progress / 100) / selectedFiles.length) * 100;
        setUploadProgress(Math.round(overall));
      });
      uploaded.push(result);
    }
    return uploaded;
  };

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);
    setError('');
    try {
      const uploaded = selectedFiles.length ? await uploadFiles() : [];
      const created = await api.createPost({
        userId: currentUser.id,
        locationId: form.locationId || null,
        title: form.title.trim(),
        content: form.content.trim() || null,
        rating: Number(form.rating) || null,
        imageKeys: uploaded.map(image => image.objectKey),
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
      onMouseDown={event => event.target === event.currentTarget && !submitting && onClose()}>
      <section className="create-post-modal" role="dialog" aria-modal="true" aria-labelledby="create-post-title">
        <header className="create-post-header">
          <button type="button" className="create-post-close" onClick={onClose}
            disabled={submitting} aria-label="Đóng">✕</button>
          <h2 id="create-post-title">Tạo bài viết mới</h2>
          <button type="submit" form="create-post-form" className="create-post-submit"
            disabled={submitting || !form.title.trim()}>
            {submitting ? 'Đang đăng...' : 'Chia sẻ'}
          </button>
        </header>

        <form id="create-post-form" className="create-post-layout" onSubmit={submit}>
          <div className="create-post-preview"
            onDragOver={event => event.preventDefault()}
            onDrop={event => {
              event.preventDefault();
              selectFiles(event.dataTransfer.files);
            }}>
            <input ref={fileInputRef} type="file" hidden multiple
              accept={ALLOWED_TYPES.join(',')} onChange={event => {
                selectFiles(event.target.files);
                event.target.value = '';
              }} />
            {previews.length ? (
              <div className="create-post-preview-grid">
                {previews.map((preview, index) => (
                  <figure key={`${preview.file.name}-${preview.file.lastModified}`}>
                    <img src={preview.url} alt={`Ảnh đã chọn ${index + 1}`} />
                    <button type="button" onClick={() => removeFile(index)}
                      disabled={submitting} aria-label={`Xóa ảnh ${index + 1}`}>✕</button>
                  </figure>
                ))}
                {previews.length < MAX_IMAGES && (
                  <button className="create-post-add-image" type="button"
                    onClick={() => fileInputRef.current?.click()} disabled={submitting}>
                    <Icon name="plus" alt="" />
                    Thêm ảnh
                  </button>
                )}
              </div>
            ) : (
              <button className="create-post-empty-preview" type="button"
                onClick={() => fileInputRef.current?.click()} disabled={submitting}>
                <Icon name="picture" alt="" />
                <strong>Chọn ảnh món ngon của bạn</strong>
                <span>Kéo thả hoặc nhấn để chọn tối đa {MAX_IMAGES} ảnh</span>
              </button>
            )}
            {submitting && selectedFiles.length > 0 && (
              <div className="upload-progress" role="status" aria-live="polite">
                <span style={{ width: `${uploadProgress}%` }} />
                <strong>Đang tải ảnh {uploadProgress}%</strong>
              </div>
            )}
          </div>

          <div className="create-post-fields">
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
                disabled={submitting} />
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
