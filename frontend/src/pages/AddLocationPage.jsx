import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api, getCurrentUser, uploadImage } from '../services/api';
import Icon from '../styles/icon';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function AddLocationPage({ onBack }) {
  const currentUser = getCurrentUser();
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', address: '', phone: '',
    priceMin: '', priceMax: '', description: '',
    lat: '', lng: '',
  });

  const categories = ['Phở', 'Bún Bò', 'Bánh Mì', 'Cơm Tấm', 'Lẩu', 'Cà phê', 'Tráng miệng', 'Khác'];
  const previews = useMemo(
    () => selectedFiles.map(file => ({ file, url: URL.createObjectURL(file) })),
    [selectedFiles],
  );

  useEffect(() => () => previews.forEach(preview => URL.revokeObjectURL(preview.url)), [previews]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);
    setError('');
    try {
      if (selectedFiles.length && !currentUser?.id) {
        throw new Error('Bạn cần đăng nhập để tải ảnh địa điểm');
      }
      const uploaded = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const result = await uploadImage(selectedFiles[index], currentUser.id, progress => {
          const overall = ((index + progress / 100) / selectedFiles.length) * 100;
          setUploadProgress(Math.round(overall));
        });
        uploaded.push(result);
      }

      const prices = [form.priceMin, form.priceMax].filter(Boolean).map(Number);
      await api.createLocation({
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        latitude: form.lat ? Number(form.lat) : null,
        longitude: form.lng ? Number(form.lng) : null,
        openTime: null,
        closeTime: null,
        averagePrice: prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : null,
        userId: currentUser?.id || null,
        imageKeys: uploaded.map(image => image.objectKey),
      });
      setSubmitted(true);
      setTimeout(() => onBack?.(), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="lf-form-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="form-success-icon">
          <Icon name="plus" alt="" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 10 }}>Thêm thành công!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quán ăn đang chờ kiểm duyệt. Cảm ơn bạn đã đóng góp!</p>
      </div>
    );
  }

  return (
    <div className="lf-form-page" id="add-location-page">
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontWeight: 600, cursor: 'pointer' }}
      >
        ← Quay lại
      </button>

      <div className="form-page-title">
        <Icon name="picture" alt="" className="form-title-icon" /> Thêm quán ăn mới
      </div>

      <form className="lf-form" onSubmit={handleSubmit} id="add-location-form">
        {/* Upload */}
        <div
          className="upload-area"
          onClick={() => !submitting && fileInputRef.current?.click()}
          onKeyDown={event => {
            if (!submitting && (event.key === 'Enter' || event.key === ' ')) fileInputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload ảnh"
          id="upload-area"
        >
          <input ref={fileInputRef} type="file" id="img-upload" hidden multiple
            accept={ALLOWED_TYPES.join(',')} disabled={submitting} onChange={event => {
              selectFiles(event.target.files);
              event.target.value = '';
            }} />
          {previews.length ? (
            <div className="location-upload-grid">
              {previews.map((preview, index) => (
                <figure key={`${preview.file.name}-${preview.file.lastModified}`}>
                  <img src={preview.url} alt={`Ảnh địa điểm ${index + 1}`} />
                  <button type="button" onClick={event => {
                    event.stopPropagation();
                    removeFile(index);
                  }} aria-label={`Xóa ảnh ${index + 1}`}>✕</button>
                </figure>
              ))}
              {previews.length < MAX_IMAGES && (
                <div className="location-upload-more"><Icon name="plus" alt="" /> Thêm ảnh</div>
              )}
            </div>
          ) : (
            <>
              <div className="upload-icon"><Icon name="picture" alt="" /></div>
              <p className="upload-text">Nhấn để chọn ảnh quán</p>
              <p className="upload-subtext">JPG, PNG, WEBP, GIF • Tối đa 10MB / ảnh</p>
            </>
          )}
          {submitting && selectedFiles.length > 0 && (
            <div className="location-upload-progress" role="status">
              <span style={{ width: `${uploadProgress}%` }} />
              Đang tải ảnh {uploadProgress}%
            </div>
          )}
        </div>

        {/* Basic info */}
        <div className="form-group">
          <label className="form-label" htmlFor="loc-name">Tên quán *</label>
          <input
            type="text"
            id="loc-name"
            name="name"
            className="form-input"
            placeholder="Ví dụ: Phở Thìn Hà Nội"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="loc-category">Loại món ăn *</label>
            <select
              id="loc-category"
              name="category"
              className="form-input form-select"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Chọn loại món...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="loc-phone">Số điện thoại</label>
            <input
              type="tel"
              id="loc-phone"
              name="phone"
              className="form-input"
              placeholder="024 3825 ..."
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="loc-address">Địa chỉ *</label>
          <input
            type="text"
            id="loc-address"
            name="address"
            className="form-input"
            placeholder="Số nhà, tên đường, quận/huyện, tỉnh/thành phố"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="loc-lat">Vĩ độ (Latitude)</label>
            <input
              type="number"
              id="loc-lat"
              name="lat"
              className="form-input"
              placeholder="21.0285"
              step="any"
              value={form.lat}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="loc-lng">Kinh độ (Longitude)</label>
            <input
              type="number"
              id="loc-lng"
              name="lng"
              className="form-input"
              placeholder="105.8048"
              step="any"
              value={form.lng}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="loc-price-min">Giá từ (VNĐ)</label>
            <input
              type="number"
              id="loc-price-min"
              name="priceMin"
              className="form-input"
              placeholder="35000"
              value={form.priceMin}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="loc-price-max">Giá đến (VNĐ)</label>
            <input
              type="number"
              id="loc-price-max"
              name="priceMax"
              className="form-input"
              placeholder="60000"
              value={form.priceMax}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="loc-desc">Mô tả quán</label>
          <textarea
            id="loc-desc"
            name="description"
            className="form-input form-textarea"
            placeholder="Chia sẻ đặc điểm nổi bật của quán, món ăn ngon nhất, giờ mở cửa..."
            value={form.description}
            onChange={handleChange}
          />
        </div>

        {/* Rating */}
        <div className="form-group">
          <label className="form-label">Đánh giá ban đầu của bạn</label>
          <div className="star-rating" id="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} sao`}
                id={`star-${star}`}
              >
                ★
              </button>
            ))}
            {rating > 0 && (
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginLeft: 8, alignSelf: 'center' }}>
                {['', 'Tệ', 'Không hay', 'Bình thường', 'Tốt', 'Xuất sắc!'][rating]}
              </span>
            )}
          </div>
        </div>

        {error && <div style={{ color: '#c5221f', marginBottom: 12 }}>{error}</div>}
        <button type="submit" disabled={submitting} className="form-submit-btn" id="submit-location-btn">
          <Icon name="plus" alt="" className="inline-icon submit-icon" /> {submitting ? 'Đang đăng...' : 'Đăng quán ăn'}
        </button>
      </form>
    </div>
  );
}
