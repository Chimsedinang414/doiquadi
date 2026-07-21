import React, { useState } from 'react';

export default function PostCard({ post, onLike, onSave, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [showMore, setShowMore] = useState(false);

  const handleComment = () => {
    if (commentText.trim()) {
      onComment && onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${post.colors?.[0] || '#f58529'}, ${post.colors?.[1] || '#dd2a7b'})`,
  };

  return (
    <article className="lf-post" id={`post-${post.id}`}>
      {/* Header */}
      <div className="post-head">
        <div className="post-head-left">
          <div className="post-avatar" style={gradientStyle}>
            <span style={{ fontSize: '1.3rem' }}>{post.emoji}</span>
          </div>
          <div>
            <div className="post-user-name">{post.restaurantName}</div>
            <div className="post-meta">
              <span>📍 {post.address?.split(',').slice(-2).join(',').trim()}</span>
              <span>·</span>
              <span style={{ color: post.open ? '#1e7e34' : '#c5221f', fontWeight: 600 }}>
                {post.open ? '🟢 Đang mở' : '🔴 Đóng cửa'}
              </span>
            </div>
          </div>
        </div>
        <button className="post-more-btn" aria-label="Thêm tùy chọn">•••</button>
      </div>

      {/* Image / Placeholder */}
      <div className="post-img-wrap">
        <div className="post-img-placeholder" style={gradientStyle}>
          <span style={{ fontSize: '5rem' }}>{post.emoji}</span>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', fontWeight: 700 }}>
            {post.restaurantName}
          </p>
          <small style={{ color: 'rgba(255,255,255,0.7)' }}>{post.category}</small>
        </div>
        <div className="post-img-badge">
          🍽️ {post.category}
        </div>
        <div className="post-rating-badge">
          ⭐ {post.rating} ({post.reviews >= 1000 ? `${(post.reviews / 1000).toFixed(1)}k` : post.reviews})
        </div>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="post-actions-left">
          <button
            className={`action-btn ${post.liked ? 'liked' : ''}`}
            onClick={() => onLike && onLike(post.id)}
            aria-label={post.liked ? 'Bỏ thích' : 'Thích'}
            title={post.liked ? 'Bỏ thích' : 'Thích'}
          >
            {post.liked ? '❤️' : '🤍'}
          </button>
          <button className="action-btn" aria-label="Bình luận" title="Bình luận">💬</button>
          <button className="action-btn" aria-label="Chia sẻ" title="Chia sẻ">📤</button>
        </div>
        <button
          className={`action-btn ${post.saved ? 'saved' : ''}`}
          onClick={() => onSave && onSave(post.id)}
          aria-label={post.saved ? 'Bỏ lưu' : 'Lưu'}
          title={post.saved ? 'Bỏ lưu' : 'Lưu'}
        >
          {post.saved ? '🔖' : '📑'}
        </button>
      </div>

      {/* Body */}
      <div className="post-body">
        <div className="post-likes">
          {post.likes >= 1000
            ? `${(post.likes / 1000).toFixed(1)}k lượt thích`
            : `${post.likes} lượt thích`}
        </div>

        <div className="post-caption">
          <strong>{post.restaurantName}</strong>{' '}
          {showMore
            ? post.description
            : post.description?.slice(0, 100) + (post.description?.length > 100 ? '...' : '')}
          {post.description?.length > 100 && (
            <button
              onClick={() => setShowMore(!showMore)}
              style={{ color: 'var(--text-secondary)', marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              {showMore ? 'thu gọn' : 'thêm'}
            </button>
          )}
        </div>

        <div className="post-tags">
          {post.tags?.map(tag => (
            <span key={tag} className="post-tag">{tag}</span>
          ))}
        </div>

        {post.commentsCount > 0 && (
          <div className="post-comment-count">
            Xem tất cả {post.commentsCount} bình luận
          </div>
        )}

        <div className="post-add-comment">
          <input
            type="text"
            className="post-comment-input"
            placeholder="Thêm bình luận..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            id={`comment-input-${post.id}`}
          />
          {commentText && (
            <button className="post-comment-submit visible" onClick={handleComment}>
              Đăng
            </button>
          )}
        </div>

        <div className="post-time">{post.time}</div>
      </div>
    </article>
  );
}
