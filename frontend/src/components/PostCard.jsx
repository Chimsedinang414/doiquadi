import React, { useRef, useState } from 'react';
import Icon from '../styles/icon';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';
import { getCurrentUser } from '../services/api';
import EditPostModal from './EditPostModal';

export default function PostCard({ post, onLike, onSave, onComment }) {
  const [commentText, setCommentText] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const commentInputRef = useRef(null);
  const carouselRef = useRef(null);

  const currentUser = getCurrentUser();
  const isAuthor = currentUser && post.author && currentUser.id === post.author.id;

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

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  return (
    <article className="lf-post" id={`post-${post.id}`}>
      <div className="post-head">
        <div className="post-head-left">
          <div className="post-avatar" style={gradientStyle}>
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" />
              : <span>{post.author ? getUserInitial(post.author)
                : <Icon name="user" alt="" className="avatar-fallback-icon" />}</span>}
          </div>
          <div>
            <div className="post-user-name">{getUserDisplayName(post.author, post.restaurantName)}</div>
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
        
        <div style={{ position: 'relative' }}>
          <button className="post-more-btn" type="button" aria-label="Thêm tùy chọn"
            onClick={() => setShowEditMenu(prev => !prev)}>•••</button>
          {showEditMenu && isAuthor && (
            <div className="post-options-menu" style={{
              position: 'absolute', right: 0, top: '100%', background: '#fff', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderRadius: '8px', zIndex: 10, padding: '4px',
              minWidth: '150px'
            }}>
              <button type="button" onClick={() => { setIsEditing(true); setShowEditMenu(false); }} 
                style={{ padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}>
                Chỉnh sửa bài viết
              </button>
              <button type="button" onClick={async () => {
                setShowEditMenu(false);
                if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
                  try {
                    await import('../services/api').then(m => m.api.deletePost(post.id, currentUser.id));
                    window.location.reload();
                  } catch (e) {
                    alert(e.message);
                  }
                }
              }} 
                style={{ padding: '8px 16px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem', color: '#c5221f' }}>
                Xóa bài viết
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="post-img-wrap" onDoubleClick={() => onLike?.(post.id)}>
        {post.imageUrls && post.imageUrls.length > 0 ? (
          <>
            <div className="post-img-carousel" ref={carouselRef} onScroll={handleScroll}>
              {post.imageUrls.map((url, index) => (
                <img key={index} className="post-main-image" src={url} alt={post.description || post.restaurantName} />
              ))}
            </div>
            {post.imageUrls.length > 1 && (
              <div className="post-carousel-dots">
                {post.imageUrls.map((_, index) => (
                  <div key={index} className={`post-carousel-dot ${index === currentImageIndex ? 'active' : ''}`} />
                ))}
              </div>
            )}
          </>
        ) : post.imageUrl ? (
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
          <strong>{getUserDisplayName(post.author, post.restaurantName)}</strong>{' '}
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
      {isEditing && (
        <EditPostModal 
          currentUser={currentUser} 
          post={post} 
          onClose={() => setIsEditing(false)} 
          onUpdated={(updatedPost) => {
            setIsEditing(false);
            window.location.reload(); // Reload to refresh feed
          }} 
        />
      )}
    </article>
  );
}
