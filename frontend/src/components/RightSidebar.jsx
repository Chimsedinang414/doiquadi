import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../styles/icon';
import { api } from '../services/api';

export default function RightSidebar({ posts = [], currentUser, onProfileOpen, onAuthRequired }) {
  const [followed, setFollowed] = useState({});
  const [pending, setPending] = useState({});
  const [followError, setFollowError] = useState('');

  const trends = [...new Set(posts.flatMap(post => post.tags || []))].slice(0, 5);
  const suggestions = useMemo(() => {
    const authors = posts
      .map(post => post.author)
      .filter(author => author?.id && author.id !== currentUser?.id);
    return [...new Map(authors.map(author => [author.id, author])).values()].slice(0, 5);
  }, [posts, currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id || suggestions.length === 0) return undefined;
    let active = true;
    Promise.all(suggestions.map(user => api.getProfile(user.id, currentUser.id)
      .then(profile => [user.id, profile.followedByViewer])
      .catch(() => [user.id, false])))
      .then(entries => {
        if (active) setFollowed(previous => ({ ...previous, ...Object.fromEntries(entries) }));
      });
    return () => {
      active = false;
    };
  }, [suggestions, currentUser?.id]);

  const toggleFollow = async user => {
    if (!currentUser?.id) {
      onAuthRequired?.();
      return;
    }
    setPending(previous => ({ ...previous, [user.id]: true }));
    setFollowError('');
    try {
      const result = await api.toggleFollow({ followerId: currentUser.id, followingId: user.id });
      setFollowed(previous => ({ ...previous, [user.id]: result.active }));
    } catch (err) {
      setFollowError(err.message);
    } finally {
      setPending(previous => ({ ...previous, [user.id]: false }));
    }
  };

  return (
    <aside className="lf-right-sidebar">
      <button className="profile-card" type="button" disabled={!currentUser}
        onClick={() => currentUser && onProfileOpen(currentUser.id)}>
        <div className="profile-card-avatar">
          {currentUser?.avatar
            ? <img src={currentUser.avatar} alt="" />
            : <span>{currentUser?.userName?.[0]?.toUpperCase()
              || <Icon name="user" alt="" className="avatar-fallback-icon" />}</span>}
        </div>
        <div className="profile-card-info">
          <div className="profile-card-name">{currentUser?.userName || 'Khách'}</div>
          <div className="profile-card-handle">{currentUser?.email || 'Đăng nhập để kết nối'}</div>
        </div>
        {currentUser && <span className="profile-card-open" aria-hidden="true">›</span>}
      </button>

      <section className="suggestions-section" aria-labelledby="suggestions-title">
        <div className="suggestions-header">
          <div className="suggestions-title" id="suggestions-title">Gợi ý cho bạn</div>
          <span className="suggestions-community">Từ cộng đồng</span>
        </div>
        {followError && <div className="suggestion-error" role="alert">{followError}</div>}
        {suggestions.length === 0 && (
          <div className="suggestions-empty">Gợi ý mới sẽ xuất hiện khi cộng đồng có thêm bài viết.</div>
        )}
        {suggestions.map((user, index) => (
          <div className="suggestion-item" key={user.id} style={{ animationDelay: `${index * 60}ms` }}>
            <button className="suggestion-person" type="button" onClick={() => onProfileOpen(user.id)}>
              <span className="suggestion-avatar">
                {user.avatar ? <img src={user.avatar} alt="" /> : user.userName?.[0]?.toUpperCase()}
              </span>
              <span className="suggestion-info">
                <strong className="suggestion-name">{user.userName}</strong>
                <small className="suggestion-meta">Có bài viết bạn có thể thích</small>
              </span>
            </button>
            <button className={'btn-follow' + (followed[user.id] ? ' following' : '')}
              type="button" disabled={pending[user.id]} onClick={() => toggleFollow(user)}>
              {pending[user.id] ? '...' : followed[user.id] ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          </div>
        ))}
      </section>

      <div className="trends-section">
        <div className="trends-title">Xu hướng ẩm thực</div>
        {trends.length === 0 && <div className="trend-item">Chưa có dữ liệu</div>}
        {trends.map(tag => <div key={tag} className="trend-item"><span className="trend-tag">{tag}</span></div>)}
      </div>
    </aside>
  );
}