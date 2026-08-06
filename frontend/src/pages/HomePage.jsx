import React, { useEffect, useMemo, useRef, useState } from 'react';
import StoryBar from '../components/StoryBar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import CreatePostModal from '../components/CreatePostModal';
import Icon from '../styles/icon';
import { api, getCurrentUser, toPostView } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

export default function HomePage({ onProfileOpen, onAuthNavigate }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [composerOpen, setComposerOpen] = useState(false);
  const [savedLocationIds, setSavedLocationIds] = useState(new Set());
  const loadMoreRef = useRef(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const [postsData, favoritesData] = await Promise.all([
          api.getPosts(),
          currentUser?.id ? api.getFavorites(currentUser.id).catch(() => []) : Promise.resolve([]),
        ]);
        const savedIds = new Set(favoritesData.map(fav => fav.location?.id).filter(Boolean));
        setSavedLocationIds(savedIds);
        setPosts(postsData.map(post => toPostView(post, savedIds)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [currentUser?.id]);

  const visiblePosts = useMemo(() => posts.slice(0, visibleCount), [posts, visibleCount]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || visibleCount >= posts.length) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) setVisibleCount(previous => Math.min(previous + 4, posts.length));
    }, { rootMargin: '240px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [posts.length, visibleCount]);

  const openComposer = () => {
    if (!currentUser?.id) {
      onAuthNavigate?.('login');
      return;
    }
    setComposerOpen(true);
  };

  const requireUser = () => {
    if (!currentUser?.id) {
      setError('Bạn cần đăng nhập để thực hiện thao tác này');
      return null;
    }
    return currentUser.id;
  };

  const handleLike = async postId => {
    const userId = requireUser();
    if (!userId) return;
    try {
      const result = await api.toggleLike(postId, userId);
      setPosts(previous => previous.map(post => post.id === postId
        ? { ...post, liked: result.active, likes: post.likes + (result.active ? 1 : -1) }
        : post));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async postId => {
    const userId = requireUser();
    const post = posts.find(item => item.id === postId);
    if (!userId || !post?.locationId) return;
    try {
      const result = await api.toggleFavorite({ userId, locationId: post.locationId });
      setPosts(previous => previous.map(item => item.id === postId ? { ...item, saved: result.active } : item));
      setSavedLocationIds(previous => {
        const next = new Set(previous);
        if (result.active) {
          next.add(post.locationId);
        } else {
          next.delete(post.locationId);
        }
        return next;
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComment = async (postId, content) => {
    const userId = requireUser();
    if (!userId) return;
    try {
      await api.addComment(postId, { userId, content });
      setPosts(previous => previous.map(post => post.id === postId
        ? { ...post, commentsCount: post.commentsCount + 1 }
        : post));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreated = created => {
    setPosts(previous => [toPostView(created, savedLocationIds), ...previous]);
    setVisibleCount(previous => previous + 1);
    setComposerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lf-home" id="home-page">
      <div className="home-feed-column">
        <StoryBar posts={posts} />
        <button className="home-compose-prompt" type="button" onClick={openComposer}>
          <span className="home-compose-avatar">
            {currentUser?.avatar ? <img src={currentUser.avatar} alt="" />
              : currentUser ? getUserInitial(currentUser) : <Icon name="user" alt="" />}
          </span>
          <span className="home-compose-copy">
            <strong>{currentUser ? `Chào ${getUserDisplayName(currentUser)}` : 'Chia sẻ cùng LocalFood'}</strong>
            <small>Bạn vừa khám phá món ngon nào?</small>
          </span>
          <Icon name="picture" alt="" className="home-compose-picture" />
        </button>

        {error && <div className="home-feed-error" role="alert">{error}</div>}
        <div className="lf-feed">
          {loading && <div className="feed-state">Đang tải bài viết...</div>}
          {!loading && posts.length === 0 && !error && (
            <div className="feed-state empty">
              <Icon name="picture" alt="" />
              <strong>Chưa có bài viết nào</strong>
              <button type="button" onClick={openComposer}>Tạo bài viết đầu tiên</button>
            </div>
          )}
          {visiblePosts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave}
              onComment={handleComment} />
          ))}
          <div ref={loadMoreRef} className="feed-load-sentinel" aria-live="polite">
            {visibleCount < posts.length
              ? <><span className="feed-loader" /> Đang tải thêm...</>
              : posts.length > 0 && <span>Bạn đã xem hết bài viết mới.</span>}
          </div>
        </div>
      </div>

      <RightSidebar posts={posts} currentUser={currentUser} onProfileOpen={onProfileOpen}
        onAuthRequired={() => onAuthNavigate?.('login')} />
      <button className="floating-create-post" type="button" onClick={openComposer}
        aria-label="Tạo bài viết mới" title="Tạo bài viết mới">
        <Icon name="edit-filled" alt="" />
      </button>
      {composerOpen && currentUser && (
        <CreatePostModal currentUser={currentUser} onClose={() => setComposerOpen(false)}
          onCreated={handleCreated} />
      )}
    </div>
  );
}
