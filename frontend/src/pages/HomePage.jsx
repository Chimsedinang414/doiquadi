import React, { useEffect, useState } from 'react';
import StoryBar from '../components/StoryBar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { api, getCurrentUser, toPostView } from '../services/api';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();

  useEffect(() => {
    api.getPosts()
      .then(data => setPosts(data.map(toPostView)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
      setPosts(previous => previous.map(item => item.id === postId
        ? { ...item, saved: result.active }
        : item));
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

  return (
    <div className="lf-home" id="home-page">
      <div>
        <StoryBar posts={posts} />
        {error && <div style={{ padding: 16, color: '#c5221f' }}>{error}</div>}
        <div className="lf-feed">
          {loading && <div style={{ padding: 32, textAlign: 'center' }}>Đang tải bài viết...</div>}
          {!loading && posts.length === 0 && !error && (
            <div style={{ padding: 32, textAlign: 'center' }}>Chưa có bài viết nào.</div>
          )}
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              onComment={handleComment}
              style={{ animationDelay: String(index * 0.08) + 's' }}
            />
          ))}
        </div>
      </div>
      <RightSidebar posts={posts} currentUser={currentUser} />
    </div>
  );
}