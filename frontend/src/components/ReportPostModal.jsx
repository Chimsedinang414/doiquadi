import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam hoặc quảng cáo' },
  { value: 'MISINFORMATION', label: 'Thông tin sai lệch' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Nội dung không phù hợp' },
  { value: 'HARASSMENT', label: 'Quấy rối hoặc bắt nạt' },
  { value: 'WRONG_LOCATION', label: 'Sai địa điểm' },
  { value: 'COPYRIGHT', label: 'Vi phạm bản quyền' },
  { value: 'PRIVACY_VIOLATION', label: 'Vi phạm quyền riêng tư' },
  { value: 'FAKE_ACCOUNT', label: 'Tài khoản giả mạo' },
  { value: 'OTHER', label: 'Lý do khác' },
];

export default function ReportPostModal({ postId, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    const closeOnEscape = event => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('social-modal-open');
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('social-modal-open');
    };
  }, [onClose, submitting]);

  const submit = async event => {
    event.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      await api.createReport({
        targetType: 'POST',
        targetId: postId,
        reason,
        description: description.trim() || null,
      });
      setResult({ type: 'success', message: 'Báo cáo đã được gửi thành công. Đội ngũ kiểm duyệt sẽ xem xét nội dung này.' });
    } catch (err) {
      setResult({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-overlay" role="presentation"
      onMouseDown={event => event.target === event.currentTarget && !submitting && onClose()}>
      <section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
        <header className="report-header">
          <button type="button" className="report-close" onClick={onClose}
            disabled={submitting} aria-label="Đóng">✕</button>
          <h2 id="report-modal-title">Báo cáo bài viết</h2>
          <div style={{ width: 36 }} />
        </header>

        {result?.type === 'success' ? (
          <div className="report-body">
            <div className="report-success">
              <span className="report-success-icon">✓</span>
              <p>{result.message}</p>
              <button type="button" className="report-done-btn" onClick={onClose}>Đóng</button>
            </div>
          </div>
        ) : (
          <form id="report-form" className="report-body" onSubmit={submit}>
            <p className="report-intro">
              Vui lòng chọn lý do bạn muốn báo cáo bài viết này. Báo cáo của bạn sẽ được xem xét bởi đội ngũ kiểm duyệt.
            </p>

            {result?.type === 'error' && (
              <div className="report-error" role="alert">{result.message}</div>
            )}

            <fieldset className="report-reasons" disabled={submitting}>
              <legend>Chọn lý do</legend>
              {REPORT_REASONS.map(item => (
                <label key={item.value} className={`report-reason-option${reason === item.value ? ' selected' : ''}`}>
                  <input type="radio" name="reason" value={item.value}
                    checked={reason === item.value}
                    onChange={event => setReason(event.target.value)} />
                  <span className="report-reason-radio" />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="report-description-field">
              <span>Mô tả chi tiết (tùy chọn)</span>
              <textarea value={description} onChange={event => setDescription(event.target.value)}
                maxLength={2000} placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
                disabled={submitting} />
              <small>{description.length}/2000</small>
            </label>

            <button type="submit" className="report-submit-btn" disabled={submitting || !reason}>
              {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
