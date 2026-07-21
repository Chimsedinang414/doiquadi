import React, { useState } from 'react';
import StoryBar from '../components/StoryBar';
import PostCard from '../components/PostCard';
import RightSidebar from '../components/RightSidebar';
import { mockPosts } from '../services/mockData';

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts);

  const handleLike = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const handleSave = (postId) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  };

  return (
    <div className="lf-home" id="home-page">
      {/* Feed Column */}
      <div>
        <StoryBar />
        <div className="lf-feed">
          {posts.map((post, i) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onSave={handleSave}
              style={{ animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
