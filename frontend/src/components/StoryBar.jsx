import React, { useState } from 'react';
import { mockStories } from '../services/mockData';

export default function StoryBar() {
  const [stories, setStories] = useState(mockStories);

  const handleStoryClick = (id) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, seen: true } : s));
  };

  return (
    <div className="lf-stories">
      {/* Add Story */}
      <div className="story-item" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: 66, height: 66 }}>
          <div className="story-add-btn">＋</div>
        </div>
        <span className="story-name">Của bạn</span>
      </div>

      {stories.map((story) => (
        <div key={story.id} className="story-item" onClick={() => handleStoryClick(story.id)}>
          <div className={`story-ring ${story.seen ? 'seen' : ''}`}>
            <div className="story-avatar">
              <span style={{ fontSize: '1.8rem' }}>{story.emoji}</span>
            </div>
          </div>
          <span className="story-name">{story.name}</span>
        </div>
      ))}
    </div>
  );
}
