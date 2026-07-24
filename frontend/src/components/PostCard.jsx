import React, { useRef, useState } from 'react';
import Icon from '../styles/icon';

export default function PostCard({ post, onLike, onSave, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const commentInputRef = useRef(null);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${post.colors?.[0] || '#f58529'}, ${post.colors?.[1] || '#dd2a7b'})`,
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment?.(post.id, commentText);
    setCommentText('');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#post-${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.restaurantName, text: post.description, url });
        setShareStatus('Đã chia sẻ bài viết');
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus('Đã sao chép liên kết');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      setShareStatus('Không thể chia sẻ lúc này');
    }
    window.setTimeout(() => setShareStatus(''), 2200);
  };

  return (
    <article className="lf-post" id={`post-${post.id}`}>
      <div className="post-head">
        <div className="post-head-left">
          <div className="post-avatar" style={gradientStyle}>
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" />
              : <span>{post.author?.userName?.[0]?.toUpperCase()
                || <Icon name="user" alt="" className="avatar-fallback-icon" />}</span>}
          </div>
          <div>
            <div className="post-user-name">{post.author?.userName || post.restaurantName}</div>
            <div className="post-meta">
              <span className="post-meta-location">
                <Icon name="marker" alt="" className="inline-icon" />
                {post.address?.split(',').slice(-2).join(',').trim() || 'Bài viết cộng đồng'}
              </span>
              <span>·</span>
              <span style={{ color: post.open ? '#1e7e34' : '#c5221f', fontWeight: 600 }}>
                <i className={'status-dot ' + (post.open ? 'open' : 'closed')} />
                {post.open ? 'Đang mở' : 'Đóng cửa'}
              </span>
            </div>
          </div>
        </div>
        <button className="post-more-btn" type="button" aria-label="Thêm tùy chọn">•••</button>
      </div>

      <div className="post-img-wrap" onDoubleClick={() => onLike?.(post.id)}>
        {post.imageUrl ? (
          <img className="post-main-image" src={post.imageUrl} alt={post.description || post.restaurantName} />
        ) : (
          <div className="post-img-placeholder" style={gradientStyle}>
            <Icon name="picture" alt="" className="placeholder-picture-icon" />
            <p>{post.restaurantName}</p>
            <small>{post.category}</small>
          </div>
        )}
        <div className="post-img-badge">
          <Icon name="picture" alt="" className="inline-icon" /> {post.category}
        </div>
        {post.rating > 0 && (
          <div className="post-rating-badge">★ {post.rating}</div>
        )}
      </div>

      <div className="post-actions">
        <div className="post-actions-left">
          <button className={`action-btn ${post.liked ? 'liked' : ''}`}
            onClick={() => onLike?.(post.id)} aria-label={post.liked ? 'Bỏ thích' : 'Thích'}>
            {post.liked ? '❤️' : '🤍'}
          </button>
          <button className="action-btn" aria-label="Bình luận"
            onClick={() => commentInputRef.current?.focus()}>
            <Icon name="envelope" alt="" className="action-icon" />
          </button>
          <button className="action-btn" aria-label="Chia sẻ" onClick={handleShare}>
            <Icon name="share" alt="" className="action-icon" />
          </button>
        </div>
        <button className={`action-btn ${post.saved ? 'saved' : ''}`}
          onClick={() => onSave?.(post.id)} aria-label={post.saved ? 'Bỏ lưu' : 'Lưu'}>
          <Icon name="bookmark" alt="" className="action-icon" />
        </button>
      </div>

      <div className="post-body">
        {shareStatus && <div className="post-share-status" role="status">{shareStatus}</div>}
        <div className="post-likes">
          {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k lượt thích` : `${post.likes} lượt thích`}
        </div>
        <div className="post-caption">
          <strong>{post.author?.userName || post.restaurantName}</strong>{' '}
          {showMore ? post.description : post.description?.slice(0, 120)}
          {post.description?.length > 120 && (
            <button className="post-caption-more" type="button" onClick={() => setShowMore(previous => !previous)}>
              {showMore ? 'thu gọn' : '... thêm'}
            </button>
          )}
        </div>
        <div className="post-tags">
          {post.tags?.map(tag => <span key={tag} className="post-tag">{tag}</span>)}
        </div>
        {post.commentsCount > 0 && (
          <div className="post-comment-count">Xem tất cả {post.commentsCount} bình luận</div>
        )}
        <div className="post-add-comment">
          <input ref={commentInputRef} type="text" className="post-comment-input"
            placeholder="Thêm bình luận..." value={commentText}
            onChange={event => setCommentText(event.target.value)}
            onKeyDown={event => event.key === 'Enter' && handleComment()} />
          {commentText && (
            <button className="post-comment-submit visible" type="button" onClick={handleComment}>Đăng</button>
          )}
        </div>
        <div className="post-time">{post.time}</div>
      </div>
    </article>
  );
}