import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { api, uploadImage } from '../services/api';
import Icon from '../styles/icon';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const MAX_IMAGES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function EditLocationModal({ currentUser, location, onClose, onUpdated }) {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // "HH:mm:ss" -> "HH:mm"
  };

  const [form, setForm] = useState({
    name: location.name || '',
    address: location.address || '',
    phone: location.phone || '',
    priceMin: location.averagePrice || '',
    openTime: formatTime(location.openTime),
    closeTime: formatTime(location.closeTime),
  });

  const [mapPosition, setMapPosition] = useState(
    location.latitude && location.longitude ? [location.latitude, location.longitude] : null
  );

  const previews = useMemo(() => [
    ...(location.imageUrls || []).map(url => ({ url, existing: true })),
    ...selectedFiles.map(file => ({ file, url: URL.createObjectURL(file), existing: false }))
  ], [location.imageUrls, selectedFiles]);

  useEffect(() => () => {
    previews.forEach(preview => {
      if (!preview.existing) URL.revokeObjectURL(preview.url);
    });
  }, [previews]);

  useEffect(() => {
    const closeOnEscape = event => event.key === 'Escape' && !submitting && onClose();
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('social-modal-open');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('social-modal-open');
    };
  }, [onClose, submitting]);

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
    const currentTotal = (location.imageUrls?.length || 0) + selectedFiles.length;
    const remaining = MAX_IMAGES - currentTotal;
    setSelectedFiles(previous => [...previous, ...candidates.slice(0, remaining)]);
    setError('');
  };

  const removeNewFile = index => {
    setSelectedFiles(previous => previous.filter((_, fileIndex) => fileIndex !== index));
  };

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setUploadProgress(0);
    setError('');
    try {
      const uploaded = [];
      for (let index = 0; index < selectedFiles.length; index += 1) {
        const result = await uploadImage(selectedFiles[index], currentUser.id, progress => {
          const overall = ((index + progress / 100) / selectedFiles.length) * 100;
          setUploadProgress(Math.round(overall));
        });
        uploaded.push(result);
      }

      const updated = await api.updateLocation(location.id, currentUser.id, {
        name: form.name,
        address: form.address || null,
        phone: form.phone || null,
        latitude: mapPosition ? mapPosition[0] : null,
        longitude: mapPosition ? mapPosition[1] : null,
        openTime: form.openTime ? form.openTime + ":00" : null,
        closeTime: form.closeTime ? form.closeTime + ":00" : null,
        averagePrice: form.priceMin ? Number(form.priceMin) : null,
        userId: currentUser.id,
        imageKeys: selectedFiles.length > 0 ? uploaded.map(image => image.objectKey) : null,
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
      <section className="create-post-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }} role="dialog" aria-modal="true" aria-labelledby="edit-location-title">
        <header className="create-post-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <button type="button" className="create-post-close" onClick={onClose}
            disabled={submitting} aria-label="Đóng">✕</button>
          <h2 id="edit-location-title">Chỉnh sửa địa điểm</h2>
          <button type="submit" form="edit-location-form" className="create-post-submit"
            disabled={submitting || !form.name.trim()}>
            {submitting ? 'Đang lưu...' : 'Lưu lại'}
          </button>
        </header>

        <form id="edit-location-form" className="create-post-layout" onSubmit={submit} style={{ padding: '20px' }}>
          <div className="create-post-fields" style={{ width: '100%' }}>
            
            {error && <div className="create-post-error" role="alert">{error}</div>}

            <label className="create-post-field">
              <span>Tên quán *</span>
              <input name="name" value={form.name} onChange={handleChange} maxLength={255}
                required autoFocus disabled={submitting} />
            </label>

            <label className="create-post-field">
              <span>Địa chỉ</span>
              <input name="address" value={form.address} onChange={handleChange} maxLength={500}
                disabled={submitting} />
            </label>
            
            <label className="create-post-field">
              <span>Điện thoại</span>
              <input name="phone" value={form.phone} onChange={handleChange} maxLength={20}
                disabled={submitting} />
            </label>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <label className="create-post-field" style={{ flex: 1, margin: 0 }}>
                <span>Giờ mở cửa</span>
                <input type="time" name="openTime" value={form.openTime} onChange={handleChange} disabled={submitting} />
              </label>
              <label className="create-post-field" style={{ flex: 1, margin: 0 }}>
                <span>Giờ đóng cửa</span>
                <input type="time" name="closeTime" value={form.closeTime} onChange={handleChange} disabled={submitting} />
              </label>
            </div>

            <label className="create-post-field">
              <span>Giá trung bình (VNĐ)</span>
              <input type="number" name="priceMin" value={form.priceMin} onChange={handleChange} disabled={submitting} />
            </label>

            <label className="create-post-field">
              <span>Ghim vị trí trên bản đồ</span>
              <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <MapContainer center={mapPosition || [21.0285, 105.8048]} zoom={13} style={{ width: '100%', height: '100%' }}>
                  <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapPicker position={mapPosition} setPosition={setMapPosition} />
                </MapContainer>
              </div>
            </label>

            <label className="create-post-field">
              <span>Ảnh quán (chọn ảnh mới sẽ thay thế ảnh cũ)</span>
              <div
                className="upload-area"
                onClick={() => !submitting && fileInputRef.current?.click()}
                style={{ marginTop: '8px', padding: '16px', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}
              >
                <input ref={fileInputRef} type="file" hidden multiple
                  accept={ALLOWED_TYPES.join(',')} disabled={submitting} onChange={event => {
                    selectFiles(event.target.files);
                    event.target.value = '';
                  }} />
                {previews.length ? (
                  <div className="location-upload-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {previews.map((preview, index) => (
                      <figure key={index} style={{ margin: 0, position: 'relative', width: '60px', height: '60px' }}>
                        <img src={preview.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        {!preview.existing && (
                          <button type="button" onClick={event => {
                            event.stopPropagation();
                            const newFilesIndex = index - (location.imageUrls?.length || 0);
                            if (newFilesIndex >= 0) {
                              removeNewFile(newFilesIndex);
                            }
                          }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', zIndex: 2 }}>✕</button>
                        )}
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div>Nhấn để chọn ảnh thay thế</div>
                )}
                {submitting && selectedFiles.length > 0 && (
                  <div style={{ marginTop: '8px', color: 'var(--brand-primary)' }}>
                    Đang tải ảnh {uploadProgress}%
                  </div>
                )}
              </div>
            </label>
          </div>
        </form>
      </section>
    </div>
  );
}
