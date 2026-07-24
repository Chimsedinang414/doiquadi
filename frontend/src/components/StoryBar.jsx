import React from 'react';
import Icon from '../styles/icon';

export default function StoryBar({ posts = [] }) {
  const locations = [...new Map(
    posts.filter(post => post.locationId).map(post => [post.locationId, post])
  ).values()].slice(0, 8);

  if (locations.length === 0) return null;

  return (
    <div className="lf-stories">
      {locations.map(post => (
        <button key={post.locationId} className="story-item" type="button"
          onClick={() => document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
          <div className="story-ring">
            <div className="story-avatar"><Icon name="picture" alt="" className="story-picture-icon" /></div>
          </div>
          <span className="story-name">{post.restaurantName}</span>
        </button>
      ))}
    </div>
  );
}