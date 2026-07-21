import React, { useState } from 'react';
import { mockPosts, mockCategories } from '../services/mockData';

const exploreItems = [
  ...mockPosts,
  { id: 5, restaurantName: 'Bánh Cuốn Gia Truyền', emoji: '🫔', category: 'Bánh', rating: 4.7, likes: 1234, commentsCount: 45, colors: ['#43e97b', '#38f9d7'] },
  { id: 6, restaurantName: 'Lẩu Hải Sản Biển Đông', emoji: '🦞', category: 'Lẩu', rating: 4.5, likes: 876, commentsCount: 32, colors: ['#4facfe', '#00f2fe'] },
  { id: 7, restaurantName: 'Cà Phê Trứng Giảng', emoji: '☕', category: 'Cà phê', rating: 4.9, likes: 5621, commentsCount: 210, colors: ['#a18cd1', '#fbc2eb'] },
  { id: 8, restaurantName: 'Chè Thái Nguyên', emoji: '🧋', category: 'Tráng miệng', rating: 4.3, likes: 654, commentsCount: 21, colors: ['#ffecd2', '#fcb69f'] },
  { id: 9, restaurantName: 'Mì Quảng Bà Mua', emoji: '🍝', category: 'Mì', rating: 4.6, likes: 1876, commentsCount: 89, colors: ['#f093fb', '#f5576c'] },
];

export default function ExplorePage({ onNavigateToDetail }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = exploreItems.filter(item => {
    const matchSearch = !search || item.restaurantName.toLowerCase().includes(search.toLowerCase()) || item.category?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || item.category?.toLowerCase().includes(activeCategory);
    return matchSearch && matchCat;
  });

  return (
    <div className="lf-explore" id="explore-page">
      {/* Search */}
      <div className="explore-search-bar">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Tìm quán ăn, món ăn, địa điểm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="explore-search-input"
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>✕</button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="explore-filters">
        {mockCategories.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            id={`filter-${cat.id}`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="explore-grid">
        {filtered.map((item, index) => (
          <div
            key={item.id}
            className="explore-grid-item"
            onClick={() => onNavigateToDetail && onNavigateToDetail(item.id)}
            title={item.restaurantName}
          >
            <div
              className="explore-img explore-placeholder"
              style={{ background: `linear-gradient(135deg, ${item.colors?.[0] || '#f58529'}, ${item.colors?.[1] || '#dd2a7b'})` }}
            >
              <span style={{ fontSize: '3.5rem' }}>{item.emoji}</span>
            </div>
            <div className="explore-overlay">
              <span>❤️ {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)}k` : item.likes}</span>
              <span>💬 {item.commentsCount}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Không tìm thấy kết quả</p>
          <p>Thử tìm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}
