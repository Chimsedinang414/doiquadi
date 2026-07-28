import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import Icon from '../styles/icon';

export default function ResetPasswordPage({ onBackToLogin }) {
  const token = useMemo(() => {
    const fragment = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    return new URLSearchParams(fragment).get('token')
      || new URLSearchParams(window.location.search).get('token');
  }, []);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) window.history.replaceState({}, document.title, '/reset-password');
  }, [token]);

  const update = event => setForm(previous => ({
    ...previous,
    [event.target.name]: event.target.value,
  }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.resetPassword({ token, newPassword: form.password });
      setMessage(result.message);
      setForm({ password: '', confirmPassword: '' });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="password-recovery-page">
      <section className="password-recovery-card" aria-live="polite">
        <div className="password-recovery-logo">
          <Icon name="localfood" alt="LocalFood" className="oauth-app-logo" />
        </div>
        <span className="password-recovery-kicker">BẢO MẬT TÀI KHOẢN</span>
        <h1>Đặt mật khẩu mới</h1>
        <p>Mật khẩu mới cần có ít nhất 12 ký tự và liên kết chỉ sử dụng được một lần.</p>

        {!token && <div className="auth-error" role="alert">Liên kết đặt lại mật khẩu không hợp lệ.</div>}
        {message && <div className="password-recovery-success" role="status">{message}</div>}
        {token && !message && (
          <form className="auth-form password-recovery-form" onSubmit={submit}>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label className="auth-field">
              <span>Mật khẩu mới</span>
              <input name="password" type="password" required minLength={12} maxLength={72}
                autoComplete="new-password" value={form.password} onChange={update} />
            </label>
            <label className="auth-field">
              <span>Xác nhận mật khẩu mới</span>
              <input name="confirmPassword" type="password" required minLength={12} maxLength={72}
                autoComplete="new-password" value={form.confirmPassword} onChange={update} />
            </label>
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <span className="auth-spinner" /> : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <button type="button" className="password-recovery-back" onClick={onBackToLogin}>
          {message ? 'Đăng nhập bằng mật khẩu mới' : 'Quay lại đăng nhập'}
        </button>
      </section>
    </main>
  );
}
