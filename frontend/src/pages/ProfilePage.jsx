import React, { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../services/api';
import UserProfileView from '../components/UserProfileView';
import Icon from '../styles/icon';

export default function ProfilePage({ initialMode = 'login', profileUserId, onNavigateToDetail, onSettings }) {
  const [user, setUser] = useState(getCurrentUser());
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ userName: '', email: '', password: '', bio: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMode(initialMode), [initialMode]);

  useEffect(() => {
    const refresh = () => setUser(getCurrentUser());
    window.addEventListener('auth-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('auth-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const update = event => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));

  const submit = async event => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = mode === 'register'
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });
      localStorage.setItem('localfoodUser', JSON.stringify(result.user));
      setUser(result.user);
      window.dispatchEvent(new Event('auth-changed'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const changeMode = nextMode => {
    setMode(nextMode);
    setError('');
  };

  if (user || profileUserId) return (
    <UserProfileView userId={profileUserId || user.id} viewer={user}
      onNavigateToDetail={onNavigateToDetail} onSettings={onSettings} />
  );

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <div className="auth-visual-panel">
          <div className="auth-brand-mark">LF</div>
          <div>
            <span className="auth-kicker">LOCALFOOD COMMUNITY</span>
            <h1>Khám phá hương vị<br />ngay quanh bạn.</h1>
            <p>Lưu địa điểm yêu thích, chia sẻ trải nghiệm và kết nối với cộng đồng đam mê ẩm thực.</p>
          </div>
          <div className="auth-proof">
            <span><Icon name="picture" alt="" className="auth-proof-icon" /> Quán ngon địa phương</span>
            <span><Icon name="marker" alt="" className="auth-proof-icon" /> Bản đồ trực quan</span>
            <span><Icon name="envelope" alt="" className="auth-proof-icon" /> Review chân thực</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-heading">
            <span className="auth-mobile-brand">LocalFood</span>
            <h2>{mode === 'register' ? 'Tạo tài khoản' : 'Chào mừng trở lại'}</h2>
            <p>{mode === 'register'
              ? 'Tham gia cộng đồng ẩm thực chỉ trong vài giây.'
              : 'Đăng nhập để tiếp tục hành trình ẩm thực của bạn.'}</p>
          </div>

          <div className="auth-tabs" role="tablist">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')} type="button">
              Đăng nhập
            </button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')} type="button">
              Đăng ký
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {error && <div className="auth-error" role="alert">{error}</div>}

            {mode === 'register' && (
              <label className="auth-field">
                <span>Tên người dùng</span>
                <input name="userName" minLength={3} maxLength={50} required
                  placeholder="Ví dụ: foodie_hanoi" value={form.userName} onChange={update} />
              </label>
            )}

            <label className="auth-field">
              <span>Email</span>
              <input name="email" type="email" required placeholder="ban@example.com"
                value={form.email} onChange={update} autoComplete="email" />
            </label>

            <label className="auth-field">
              <span>Mật khẩu</span>
              <input name="password" type="password" required
                minLength={mode === 'register' ? 6 : undefined}
                placeholder="Tối thiểu 6 ký tự" value={form.password}
                onChange={update} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            </label>

            {mode === 'register' && (
              <label className="auth-field">
                <span>Giới thiệu <small>(không bắt buộc)</small></span>
                <textarea name="bio" placeholder="Chia sẻ đôi chút về sở thích ẩm thực của bạn..."
                  value={form.bio} onChange={update} />
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <span className="auth-spinner" /> : mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth-switch-copy">
            {mode === 'register' ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button type="button" onClick={() => changeMode(mode === 'register' ? 'login' : 'register')}>
              {mode === 'register' ? 'Đăng nhập' : 'Đăng ký miễn phí'}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}