import React, { useEffect, useMemo, useState } from 'react';
import { api, getCurrentUser } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

export default function NewConversationModal({ onClose, onCreated }) {
  const [tab, setTab] = useState('direct'); // 'direct' | 'group'
  const [mutualFollows, setMutualFollows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) return;
    api.getMutualFollows(currentUser.id)
      .then(setMutualFollows)
      .catch(() => setMutualFollows([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mutualFollows;
    return mutualFollows.filter(u =>
      getUserDisplayName(u).toLowerCase().includes(q) || u.userName.toLowerCase().includes(q)
    );
  }, [mutualFollows, search]);

  const toggleSelect = (userId) => {
    if (tab === 'direct') {
      setSelected([userId]);
      return;
    }
    setSelected(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!currentUser || selected.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      let conv;
      if (tab === 'direct') {
        conv = await api.createDirectConversation({
          userId: currentUser.id,
          targetUserId: selected[0],
        });
      } else {
        if (!groupName.trim()) {
          setError('Vui lòng nhập tên nhóm');
          setSubmitting(false);
          return;
        }
        conv = await api.createGroup({
          userId: currentUser.id,
          name: groupName.trim(),
          memberIds: selected,
        });
      }
      onCreated(conv);
    } catch (e) {
      setError(e.message || 'Không thể tạo cuộc trò chuyện');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="chat-modal">
        <div className="chat-modal-header">
          <h3>Tin nhắn mới</h3>
          <button className="chat-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="chat-modal-tabs">
          <button
            className={`chat-modal-tab ${tab === 'direct' ? 'active' : ''}`}
            onClick={() => { setTab('direct'); setSelected([]); }}
          >
            Nhắn tin
          </button>
          <button
            className={`chat-modal-tab ${tab === 'group' ? 'active' : ''}`}
            onClick={() => { setTab('group'); setSelected([]); }}
          >
            Tạo nhóm
          </button>
        </div>

        {tab === 'group' && (
          <div className="chat-modal-group-name">
            <input
              placeholder="Tên nhóm..."
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        <div className="chat-modal-search">
          <input
            placeholder="Tìm kiếm bạn bè..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {tab === 'group' && selected.length > 0 && (
          <div className="chat-modal-selected">
            {selected.map(id => {
              const user = mutualFollows.find(u => u.userId === id);
              return user ? (
                <span key={id} className="chat-selected-chip">
                  {getUserDisplayName(user)}
                  <button onClick={() => toggleSelect(id)}>✕</button>
                </span>
              ) : null;
            })}
          </div>
        )}

        <div className="chat-modal-list">
          {loading ? (
            <div className="chat-modal-empty">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="chat-modal-empty">
              <strong>Không tìm thấy</strong>
              <p>Hãy follow và được follow lại để có thể nhắn tin.</p>
            </div>
          ) : (
            filtered.map(user => (
              <button
                key={user.userId}
                className="chat-modal-person"
                onClick={() => {
                  if (tab === 'direct') {
                    toggleSelect(user.userId);
                  } else {
                    toggleSelect(user.userId);
                  }
                }}
              >
                <div className="chat-modal-person-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt="" />
                    : getUserInitial(user)
                  }
                </div>
                <div className="chat-modal-person-info">
                  <div className="chat-modal-person-name">{getUserDisplayName(user)}</div>
                </div>
                {tab === 'group' ? (
                  <div className={`chat-modal-check ${selected.includes(user.userId) ? 'checked' : ''}`}>
                    {selected.includes(user.userId) && '✓'}
                  </div>
                ) : (
                  <div className={`chat-modal-check ${selected.includes(user.userId) ? 'checked' : ''}`}>
                    {selected.includes(user.userId) && '✓'}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {error && (
          <div style={{ padding: '0 16px 8px', color: '#ed4956', fontSize: '.82rem' }}>{error}</div>
        )}

        <div className="chat-modal-footer">
          <button
            className="chat-modal-submit"
            disabled={selected.length === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Đang tạo...' : tab === 'direct' ? 'Bắt đầu trò chuyện' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}
