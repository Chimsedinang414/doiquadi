import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../styles/icon';
import { api, toPostView } from '../services/api';

const copy = {
  loading: '\u0110ang t\u1ea3i trang c\u00e1 nh\u00e2n...',
  retry: 'Th\u1eed l\u1ea1i',
  edit: 'Ch\u1ec9nh s\u1eeda trang c\u00e1 nh\u00e2n',
  follow: 'Theo d\u00f5i',
  following: '\u0110ang theo d\u00f5i',
  posts: 'b\u00e0i vi\u1ebft',
  followers: 'ng\u01b0\u1eddi theo d\u00f5i',
  followingCount: '\u0111ang theo d\u00f5i',
  noBio: 'Ch\u01b0a c\u00f3 ph\u1ea7n gi\u1edbi thi\u1ec7u.',
  joined: 'Tham gia LocalFood',
  postTab: 'B\u00c0I VI\u1ebeT',
  emptyTitle: 'Ch\u01b0a c\u00f3 b\u00e0i vi\u1ebft',
  emptyOwn: 'Chia s\u1ebb qu\u00e1n ngon \u0111\u1ea7u ti\u00ean c\u1ee7a b\u1ea1n v\u1edbi c\u1ed9ng \u0111\u1ed3ng.',
  emptyOther: 'Ng\u01b0\u1eddi d\u00f9ng n\u00e0y ch\u01b0a \u0111\u0103ng b\u00e0i vi\u1ebft n\u00e0o.',
  loginToFollow: 'B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 theo d\u00f5i ng\u01b0\u1eddi n\u00e0y.',
};

const formatCount = value => new Intl.NumberFormat('vi-VN').format(value || 0);

export default function UserProfileView({ userId, viewer, onNavigateToDetail, onSettings }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followPending, setFollowPending] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    bio: '',
    avatar: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const loadProfile = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    api.getProfile(userId, viewer?.id)
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, viewer?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const posts = useMemo(() => (profile?.posts || []).map(toPostView), [profile]);
  const isOwnProfile = Boolean(viewer?.id && viewer.id === profile?.id);

  const toggleFollow = async () => {
    if (!viewer?.id) {
      setError(copy.loginToFollow);
      return;
    }
    setFollowPending(true);
    setError('');
    try {
      const result = await api.toggleFollow({ followerId: viewer.id, followingId: profile.id });
      setProfile(previous => ({
        ...previous,
        followedByViewer: result.active,
        followersCount: Math.max(0, previous.followersCount + (result.active ? 1 : -1)),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setFollowPending(false);
    }
  };

  if (loading) return (
    <section className="ig-profile-page profile-loading" aria-live="polite">
      <span className="profile-loading-ring" />
      <p>{copy.loading}</p>
    </section>
  );

  if (!profile) return (
    <section className="ig-profile-page profile-error" role="alert">
      <p>{error}</p>
      <button type="button" onClick={loadProfile}>{copy.retry}</button>
    </section>
  );

  const joined = profile.createdAt
    ? new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(profile.createdAt))
    : null;

  const formattedDob = profile.dateOfBirth
    ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(profile.dateOfBirth))
    : null;

  const openEditModal = () => {
    setEditForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || '',
      dateOfBirth: profile.dateOfBirth || '',
      bio: profile.bio || '',
      avatar: profile.avatar || '',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async event => {
    event.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      const updatedUser = await api.updateProfile(profile.id, editForm);
      setProfile(previous => ({
        ...previous,
        fullName: updatedUser.fullName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
      }));
      setShowEditModal(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <section className="ig-profile-page">
      <div className="ig-profile-header">
        <div className="ig-profile-avatar-ring">
          <div className="ig-profile-avatar">
            {profile.avatar
              ? <img src={profile.avatar} alt={`Avatar ${profile.userName}`} />
              : <span>{profile.userName?.[0]?.toUpperCase()}</span>}
          </div>
        </div>
        <div className="ig-profile-summary">
          <div className="ig-profile-title-row">
            <h1>{profile.fullName || profile.userName}</h1>
            {profile.fullName && <span className="profile-handle">@{profile.userName}</span>}
            {isOwnProfile ? (
              <button className="profile-neutral-button" type="button" onClick={openEditModal}>
                <Icon name="edit-filled" alt="" className="inline-icon" />
                {copy.edit}
              </button>
            ) : (
              <button className={'profile-follow-button' + (profile.followedByViewer ? ' following' : '')}
                type="button" onClick={toggleFollow} disabled={followPending}>
                {profile.followedByViewer ? copy.following : copy.follow}
                <Icon name={profile.followedByViewer ? 'user' : 'user-add'} alt="" className="inline-icon" />
              </button>
            )}
            {isOwnProfile && (
              <button className="profile-settings-icon" type="button" onClick={onSettings} aria-label="Cài đặt">
                <Icon name="settings" alt="" />
              </button>
            )}
          </div>
          <div className="ig-profile-stats" aria-label={'Thống kê trang cá nhân'}>
            <span><strong>{formatCount(profile.postsCount)}</strong> {copy.posts}</span>
            <span><strong>{formatCount(profile.followersCount)}</strong> {copy.followers}</span>
            <span><strong>{formatCount(profile.followingCount)}</strong> {copy.followingCount}</span>
          </div>
          <div className="ig-profile-bio">
            <strong>{profile.fullName ? `${profile.fullName} (@${profile.userName})` : profile.userName}</strong>
            <p>{profile.bio || copy.noBio}</p>
            <div className="profile-details-list">
              {profile.phoneNumber && (
                <div className="profile-detail-item">
                  <Icon name="envelope" alt="" className="inline-icon" />
                  <span>SĐT: {profile.phoneNumber}</span>
                </div>
              )}
              {profile.address && (
                <div className="profile-detail-item">
                  <Icon name="marker" alt="" className="inline-icon" />
                  <span>Địa chỉ: {profile.address}</span>
                </div>
              )}
              {formattedDob && (
                <div className="profile-detail-item">
                  <span>🎂 Ngày sinh: {formattedDob}</span>
                </div>
              )}
              {joined && <small className="profile-joined-date">{copy.joined} {joined}</small>}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="profile-inline-error" role="alert">{error}</div>}

      <div className="ig-profile-tabs">
        <button className="active" type="button">
          <Icon name="picture" alt="" className="inline-icon" />
          {copy.postTab}
        </button>
      </div>

      {posts.length ? (
        <div className="ig-profile-grid">
          {posts.map(post => (
            <button key={post.id} className="ig-profile-post" type="button"
              disabled={!post.locationId} onClick={() => post.locationId && onNavigateToDetail(post.locationId)}>
              {post.imageUrl
                ? <img src={post.imageUrl} alt={post.description || post.restaurantName} />
                : <div className="ig-profile-post-fallback">
                    <Icon name="picture" alt="" className="profile-grid-picture-icon" />
                    <strong>{post.restaurantName}</strong>
                  </div>}
              <span className="ig-profile-post-overlay">
                <strong>&hearts; {formatCount(post.likes)}</strong>
                <strong className="profile-overlay-stat">
                  <Icon name="envelope" alt="" className="inline-icon inverted-icon" /> {formatCount(post.commentsCount)}
                </strong>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="ig-profile-empty">
          <span className="ig-profile-empty-icon"><Icon name="picture" alt="" /></span>
          <h2>{copy.emptyTitle}</h2>
          <p>{isOwnProfile ? copy.emptyOwn : copy.emptyOther}</p>
        </div>
      )}

      {showEditModal && (
        <div className="edit-profile-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="edit-profile-modal-card" onClick={event => event.stopPropagation()}>
            <div className="edit-profile-modal-header">
              <h2>Chỉnh sửa trang cá nhân</h2>
              <button type="button" className="close-modal-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>

            {editError && <div className="auth-error">{editError}</div>}

            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <label className="auth-field">
                <span>Họ và tên</span>
                <input name="fullName" placeholder="Ví dụ: Nguyễn Văn A" maxLength={100}
                  value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
              </label>

              <label className="auth-field">
                <span>Số điện thoại</span>
                <input name="phoneNumber" placeholder="Ví dụ: 0912345678" maxLength={20}
                  value={editForm.phoneNumber} onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
              </label>

              <label className="auth-field">
                <span>Địa chỉ</span>
                <input name="address" placeholder="Ví dụ: Cầu Giấy, Hà Nội" maxLength={255}
                  value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
              </label>

              <label className="auth-field">
                <span>Ngày sinh</span>
                <input name="dateOfBirth" type="date"
                  value={editForm.dateOfBirth} onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
              </label>

              <label className="auth-field">
                <span>URL Ảnh đại diện</span>
                <input name="avatar" placeholder="https://..." maxLength={500}
                  value={editForm.avatar} onChange={e => setEditForm({ ...editForm, avatar: e.target.value })} />
              </label>

              <label className="auth-field">
                <span>Giới thiệu bản thân</span>
                <textarea name="bio" placeholder="Chia sẻ về sở thích ẩm thực..." rows={3}
                  value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
              </label>

              <div className="edit-profile-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Hủy</button>
                <button type="submit" className="save-btn" disabled={editSubmitting}>
                  {editSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
