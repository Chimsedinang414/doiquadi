import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [savedLocationIds, setSavedLocationIds] = useState(new Set());
  const loadMoreRef = useRef(null);
  const currentUser = getCurrentUser();

  const fetchPosts = useCallback(async (pageNum) => {
    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const [postsResponse, favoritesData] = await Promise.all([
        api.getPosts(pageNum, 10), // Page, size=10
        currentUser?.id && pageNum === 0 ? api.getFavorites(currentUser.id).catch(() => []) : Promise.resolve([]),
      ]);

      let savedIds = savedLocationIds;
      if (pageNum === 0 && currentUser?.id) {
        savedIds = new Set(favoritesData.map(fav => fav.location?.id).filter(Boolean));
        setSavedLocationIds(savedIds);
      }

      // Format paginated response
      const newPosts = postsResponse.content.map(post => toPostView(post, savedIds));

      setPosts(prev => pageNum === 0 ? newPosts : [...prev, ...newPosts]);
      setHasMore(!postsResponse.last);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentUser?.id, savedLocationIds]);

  useEffect(() => {
    fetchPosts(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]); // Re-fetch on user change

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || loading || loadingMore) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        fetchPosts(page + 1);
      }
    }, { rootMargin: '240px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchPosts]);

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
      const created = await api.addComment(postId, { userId, content });
      setPosts(previous => previous.map(post => post.id === postId
        ? { ...post, commentsCount: post.commentsCount + 1 }
        : post));
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleCreated = created => {
    setPosts(previous => [toPostView(created, savedLocationIds), ...previous]);
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
          {posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave}
              onComment={handleComment} />
          ))}
          <div ref={loadMoreRef} className="feed-load-sentinel" aria-live="polite">
            {hasMore
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
