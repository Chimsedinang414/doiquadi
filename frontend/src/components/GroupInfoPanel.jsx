import React, { useState } from 'react';
import { api, getCurrentUser } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';

export default function GroupInfoPanel({ conversation, onClose, onUpdated, onLeft }) {
  const [editName, setEditName] = useState(conversation?.name || '');
  const [saving, setSaving] = useState(false);
  const currentUser = getCurrentUser();

  const isOwner = conversation?.members?.some(
    m => m.userId === currentUser?.id && m.role === 'OWNER'
  );
  const isGroup = conversation?.type === 'GROUP';

  const handleRename = async () => {
    if (!editName.trim() || editName.trim() === conversation.name) return;
    setSaving(true);
    try {
      const updated = await api.updateGroup(conversation.id, currentUser.id, {
        name: editName.trim(),
      });
      onUpdated(updated);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (!window.confirm('Bạn có chắc muốn xóa thành viên này?')) return;
    try {
      const updated = await api.removeMember(conversation.id, currentUser.id, targetUserId);
      onUpdated(updated);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Bạn có chắc muốn rời nhóm?')) return;
    try {
      await api.removeMember(conversation.id, currentUser.id, currentUser.id);
      onLeft();
    } catch (e) {
      alert(e.message);
    }
  };

  if (!conversation) return null;

  return (
    <div className="chat-group-panel">
      <div className="chat-group-panel-header">
        <h3>Chi tiết</h3>
        <button className="chat-group-panel-close" onClick={onClose}>✕</button>
      </div>

      <div className="chat-group-panel-body">
        {isGroup && isOwner && (
          <div className="chat-group-name-edit">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Tên nhóm"
              maxLength={100}
            />
            <button onClick={handleRename} disabled={saving}>
              {saving ? '...' : 'Lưu'}
            </button>
          </div>
        )}

        <div className="chat-group-section-title">
          Thành viên ({conversation.members?.length || 0})
        </div>

        {conversation.members?.map(member => (
          <div key={member.userId} className="chat-group-member">
            <div className="chat-group-member-avatar">
              {member.avatar
                ? <img src={member.avatar} alt="" />
                : getUserInitial(member)
              }
            </div>
            <div className="chat-group-member-info">
              <div className="chat-group-member-name">
                {getUserDisplayName(member)}
                {member.userId === currentUser?.id && ' (bạn)'}
              </div>
            </div>
            {member.role === 'OWNER' && (
              <span className="chat-group-member-role">Chủ nhóm</span>
            )}
            {isOwner && member.userId !== currentUser?.id && isGroup && (
              <button
                className="chat-group-member-remove"
                onClick={() => handleRemoveMember(member.userId)}
              >
                Xóa
              </button>
            )}
          </div>
        ))}

        {isGroup && (
          <button className="chat-group-leave" onClick={handleLeave}>
            Rời nhóm
          </button>
        )}
      </div>
    </div>
  );
}
