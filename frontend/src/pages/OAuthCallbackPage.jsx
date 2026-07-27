import React, { useEffect, useMemo, useState } from 'react';
import { api, setAuthSession } from '../services/api';
import Icon from '../styles/icon';

const exchanges = new Map();

function exchangeOnce(code) {
  if (!exchanges.has(code)) {
    exchanges.set(code, api.exchangeOAuthCode(code));
  }
  return exchanges.get(code);
}

const oauthErrors = {
  ACCOUNT_LINKING_REQUIRED: 'Email này đã thuộc một tài khoản khác. Hãy đăng nhập bằng email để bảo vệ tài khoản của bạn.',
  OAUTH_EMAIL_REQUIRED: 'Nhà cung cấp không chia sẻ email. Vui lòng chọn phương thức đăng nhập khác.',
  ACCOUNT_DISABLED: 'Tài khoản này hiện đã bị vô hiệu hóa.',
  ACCESS_DENIED: 'Bạn đã hủy hoặc từ chối yêu cầu đăng nhập.',
  OAUTH2_AUTHENTICATION_FAILED: 'Không thể xác thực với nhà cung cấp. Vui lòng thử lại.',
};

export default function OAuthCallbackPage({ onComplete, onRetry }) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const code = params.get('code');
  const providerError = params.get('error');
  const [state, setState] = useState({ status: 'loading', message: 'Đang hoàn tất đăng nhập an toàn…' });

  useEffect(() => {
    let active = true;
    let redirectTimer;
    if (providerError) {
      setState({ status: 'error', message: oauthErrors[providerError] || 'Đăng nhập mạng xã hội không thành công.' });
      return undefined;
    }
    if (!code) {
      setState({ status: 'error', message: 'Liên kết đăng nhập không hợp lệ hoặc đã hết hạn.' });
      return undefined;
    }

    exchangeOnce(code)
      .then(result => {
        if (!active) return;
        setAuthSession(result);
        window.history.replaceState({}, document.title, '/');
        setState({ status: 'success', message: `Xin chào ${result.user.userName}!` });
        redirectTimer = window.setTimeout(onComplete, 700);
      })
      .catch(error => {
        if (!active) return;
        window.history.replaceState({}, document.title, '/');
        setState({ status: 'error', message: error.message || 'Không thể hoàn tất đăng nhập.' });
      });

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, [code, onComplete, providerError]);

  return (
    <main className="oauth-callback-page">
      <section className={`oauth-callback-card ${state.status}`} aria-live="polite">
        <div className="oauth-callback-logo"><Icon name="localfood" alt="LocalFood" className="oauth-app-logo" /></div>
        {state.status === 'loading' && <div className="oauth-callback-spinner" aria-hidden="true" />}
        {state.status === 'success' && <div className="oauth-callback-status success-mark" aria-hidden="true">✓</div>}
        {state.status === 'error' && <div className="oauth-callback-status error-mark" aria-hidden="true">!</div>}
        <h1>{state.status === 'loading' ? 'Đang xác thực' : state.status === 'success' ? 'Đăng nhập thành công' : 'Chưa thể đăng nhập'}</h1>
        <p>{state.message}</p>
        {state.status === 'error' && (
          <button type="button" className="auth-submit oauth-retry" onClick={onRetry}>Quay lại đăng nhập</button>
        )}
      </section>
    </main>
  );
}
