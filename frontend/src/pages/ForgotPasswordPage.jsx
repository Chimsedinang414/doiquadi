import React, { useState } from 'react';
import { api } from '../services/api';
import Icon from '../styles/icon';

export default function ForgotPasswordPage({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const submit = async event => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await api.forgotPassword({ email });
      setMessage(result.message);
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
        <h1>Quên mật khẩu?</h1>
        <p>Nhập email đã dùng để đăng ký. Nếu tài khoản đủ điều kiện, LocalFood sẽ gửi liên kết đặt lại mật khẩu.</p>

        {message ? (
          <div className="password-recovery-success" role="status">{message}</div>
        ) : (
          <form className="auth-form password-recovery-form" onSubmit={submit}>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label className="auth-field">
              <span>Email đăng ký</span>
              <input type="email" required autoComplete="email" placeholder="ban@example.com"
                value={email} onChange={event => setEmail(event.target.value)} />
            </label>
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <span className="auth-spinner" /> : 'Gửi liên kết đặt lại'}
            </button>
          </form>
        )}

        <button type="button" className="password-recovery-back" onClick={onBackToLogin}>
          Quay lại đăng nhập
        </button>
      </section>
    </main>
  );
}
