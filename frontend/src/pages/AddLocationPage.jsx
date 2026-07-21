import React, { useState } from 'react';

export default function AddLocationPage({ onBack }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', address: '', phone: '',
    priceMin: '', priceMax: '', description: '',
    lat: '', lng: '',
  });

  const categories = ['Phở', 'Bún Bò', 'Bánh Mì', 'Cơm Tấm', 'Lẩu', 'Cà phê', 'Tráng miệng', 'Khác'];

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onBack && onBack();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="lf-form-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: '5rem', marginBottom: 20, animation: 'pulse 1s ease' }}>🎉</div>
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
        <span>🍽️</span> Thêm quán ăn mới
      </div>

      <form className="lf-form" onSubmit={handleSubmit} id="add-location-form">
        {/* Upload */}
        <div
          className="upload-area"
          onClick={() => document.getElementById('img-upload').click()}
          role="button"
          aria-label="Upload ảnh"
          id="upload-area"
        >
          <input type="file" id="img-upload" hidden accept="image/*" multiple />
          <div className="upload-icon">📷</div>
          <p className="upload-text">Nhấn để tải ảnh quán</p>
          <p className="upload-subtext">JPG, PNG, HEIC • Tối đa 10MB / ảnh</p>
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

        <button type="submit" className="form-submit-btn" id="submit-location-btn">
          🚀 Đăng quán ăn
        </button>
      </form>
    </div>
  );
}
