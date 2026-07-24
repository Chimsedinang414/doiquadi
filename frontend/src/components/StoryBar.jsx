import React from 'react';

export default function StoryBar({ posts = [] }) {
  const locations = [...new Map(
    posts.filter(post => post.locationId).map(post => [post.locationId, post])
  ).values()].slice(0, 8);

  if (locations.length === 0) return null;

  return (
    <div className="lf-stories">
      {locations.map(post => (
        <div key={post.locationId} className="story-item">
          <div className="story-ring">
            <div className="story-avatar"><span style={{ fontSize: '1.8rem' }}>🍽️</span></div>
          </div>
          <span className="story-name">{post.restaurantName}</span>
        </div>
      ))}
    </div>
  );
}