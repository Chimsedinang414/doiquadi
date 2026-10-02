import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../styles/icon';
import { api, toPostView, updateCurrentUser } from '../services/api';
import { getUserDisplayName, getUserInitial } from '../utils/userDisplay';
import EditPostModal from './EditPostModal';
import EditLocationModal from './EditLocationModal';

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
  followersTitle: 'Ng\u01b0\u1eddi theo d\u00f5i',
  followingTitle: '\u0110ang theo d\u00f5i',
  searchPeople: 'Tìm kiếm',
  loadingPeople: 'Đang tải danh sách...',
  emptyFollowers: 'Chưa có người theo dõi.',
  emptyFollowing: 'Chưa theo dõi ai.',
  noSearchResults: 'Không tìm thấy tài khoản phù hợp.',
  close: 'Đóng',
  locationTab: 'ĐỊA ĐIỂM',
  emptyLocationsTitle: 'Chưa có địa điểm',
  emptyLocationsOwn: 'Thêm địa điểm quán ăn bạn yêu thích.',
  emptyLocationsOther: 'Người dùng này chưa thêm địa điểm nào.',
  checkinTab: 'CHECK-IN',
  collectionTab: 'BỘ SƯU TẬP',
  emptyCheckins: 'Chưa có lượt check-in nào.',
  emptyCollections: 'Chưa có bộ sưu tập nào.',
};

const formatCount = value => new Intl.NumberFormat('vi-VN').format(value || 0);

export default function UserProfileView({ userId, viewer, onNavigateToDetail, onProfileOpen, onSettings }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followPending, setFollowPending] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    userName: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    bio: '',
    avatar: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [connectionType, setConnectionType] = useState(null);
  const [connectionUsers, setConnectionUsers] = useState([]);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [connectionQuery, setConnectionQuery] = useState('');
  const [connectionPending, setConnectionPending] = useState(new Set());
  
  const [activeTab, setActiveTab] = useState('posts');
  const [locations, setLocations] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const loadProfile = useCallback(() => {
    if (!userId) return;
    setLoading(true);
    setError('');
    api.getProfile(userId, viewer?.id)
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
      
    api.getMyLocations(userId)
      .then(setLocations)
      .catch(console.error);

    api.getCheckins(userId)
      .then(setCheckins)
      .catch(console.error);

    api.getCollections(userId)
      .then(setCollections)
      .catch(console.error);
  }, [userId, viewer?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setConnectionType(null);
    setConnectionUsers([]);
    setConnectionQuery('');
  }, [userId]);

  useEffect(() => {
    if (!connectionType) return undefined;
    const closeOnEscape = event => {
      if (event.key === 'Escape') setConnectionType(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [connectionType]);

  const posts = useMemo(() => (profile?.posts || []).map(toPostView), [profile]);
  const isOwnProfile = Boolean(viewer?.id && viewer.id === profile?.id);
  const filteredConnectionUsers = useMemo(() => {
    const query = connectionQuery.trim().toLocaleLowerCase('vi-VN');
    if (!query) return connectionUsers;
    return connectionUsers.filter(user => [user.fullName, user.userName]
      .some(value => String(value || '').toLocaleLowerCase('vi-VN').includes(query)));
  }, [connectionQuery, connectionUsers]);

  const toggleFollow = async () => {
    if (!viewer?.id) {
      setError(copy.loginToFollow);
      return;
    }
    setFollowPending(true);
    setError('');
    try {
      const result = await api.toggleFollow(profile.id);
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

  const openConnections = async type => {
    setConnectionType(type);
    setConnectionUsers([]);
    setConnectionQuery('');
    setConnectionError('');
    setConnectionLoading(true);
    try {
      const users = type === 'followers'
        ? await api.getFollowers(profile.id)
        : await api.getFollowing(profile.id);
      setConnectionUsers(users);
    } catch (err) {
      setConnectionError(err.message);
    } finally {
      setConnectionLoading(false);
    }
  };

  const openConnectionProfile = connectionUserId => {
    setConnectionType(null);
    onProfileOpen?.(connectionUserId);
  };

  const toggleConnectionFollow = async connectionUser => {
    setConnectionPending(previous => new Set(previous).add(connectionUser.id));
    setConnectionError('');
    try {
      const result = await api.toggleFollow(connectionUser.id);
      const removeFromOwnFollowing = connectionType === 'following' && isOwnProfile && !result.active;
      setConnectionUsers(previous => removeFromOwnFollowing
        ? previous.filter(user => user.id !== connectionUser.id)
        : previous.map(user => user.id === connectionUser.id
          ? { ...user, followedByViewer: result.active }
          : user));
      if (removeFromOwnFollowing) {
        setProfile(previous => ({
          ...previous,
          followingCount: Math.max(0, previous.followingCount - 1),
        }));
      }
    } catch (err) {
      setConnectionError(err.message);
    } finally {
      setConnectionPending(previous => {
        const next = new Set(previous);
        next.delete(connectionUser.id);
        return next;
      });
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
      userName: profile.userName || '',
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
      if (isOwnProfile) updateCurrentUser(updatedUser);
      setProfile(previous => ({
        ...previous,
        userName: updatedUser.userName,
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
    try {
      await api.deletePost(postId, viewer.id);
      setProfile(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== postId) }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteLocation = async (locId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa điểm này?")) return;
    try {
      await api.deleteLocation(locId, viewer.id);
      setLocations(prev => prev.filter(l => l.id !== locId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="ig-profile-page">
      <div className="ig-profile-header">
        <div className="ig-profile-avatar-ring">
          <div className="ig-profile-avatar">
            {profile.avatar
              ? <img src={profile.avatar} alt={`Avatar ${profile.userName}`} />
              : <span>{getUserInitial(profile)}</span>}
          </div>
        </div>
        <div className="ig-profile-summary">
          <div className="ig-profile-title-row">
            <h1>{getUserDisplayName(profile)}</h1>
            <span className="profile-handle">@{profile.userName}</span>
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
            <button className="profile-stat-button" type="button" onClick={() => openConnections('followers')}>
              <strong>{formatCount(profile.followersCount)}</strong> {copy.followers}
            </button>
            <button className="profile-stat-button" type="button" onClick={() => openConnections('following')}>
              <strong>{formatCount(profile.followingCount)}</strong> {copy.followingCount}
            </button>
          </div>
          <div className="ig-profile-bio">
            <strong>{getUserDisplayName(profile)}</strong>
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
        <button className={activeTab === 'posts' ? 'active' : ''} type="button" onClick={() => setActiveTab('posts')}>
          <Icon name="picture" alt="" className="inline-icon" />
          {copy.postTab}
        </button>
        <button className={activeTab === 'locations' ? 'active' : ''} type="button" onClick={() => setActiveTab('locations')}>
          <Icon name="marker" alt="" className="inline-icon" />
          {copy.locationTab}
        </button>
        <button className={activeTab === 'checkins' ? 'active' : ''} type="button" onClick={() => setActiveTab('checkins')}>
          <Icon name="thumbtack" alt="" className="inline-icon" />
          {copy.checkinTab}
        </button>
        <button className={activeTab === 'collections' ? 'active' : ''} type="button" onClick={() => setActiveTab('collections')}>
          <Icon name="bookmark" alt="" className="inline-icon" />
          {copy.collectionTab}
        </button>
      </div>

      {activeTab === 'posts' && (
        posts.length ? (
          <div className="ig-profile-grid">
            {posts.map(post => (
              <div key={post.id} className="ig-profile-post-wrapper" style={{ position: 'relative' }}>
                <button className="ig-profile-post" type="button"
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
                {isOwnProfile && (
                  <div className="profile-post-actions" style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 4, zIndex: 2 }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingPost(profile.posts.find(p => p.id === post.id)); }} style={{ background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}>✎</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} style={{ background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="ig-profile-empty">
            <span className="ig-profile-empty-icon"><Icon name="picture" alt="" /></span>
            <h2>{copy.emptyTitle}</h2>
            <p>{isOwnProfile ? copy.emptyOwn : copy.emptyOther}</p>
          </div>
        )
      )}

      {activeTab === 'locations' && (
        locations.length ? (
          <div className="ig-profile-grid">
            {locations.map(loc => (
              <div key={loc.id} className="ig-profile-post-wrapper" style={{ position: 'relative' }}>
                <button className="ig-profile-post" type="button" onClick={() => onNavigateToDetail(loc.id)}>
                  {loc.imageUrls?.[0]
                    ? <img src={loc.imageUrls[0]} alt={loc.name} />
                    : <div className="ig-profile-post-fallback">
                        <Icon name="marker" alt="" className="profile-grid-picture-icon" />
                        <strong>{loc.name}</strong>
                      </div>}
                  <span className="ig-profile-post-overlay">
                    <strong>{loc.name}</strong>
                  </span>
                </button>
                {isOwnProfile && (
                  <div className="profile-post-actions" style={{ position: 'absolute', top: 5, right: 5, display: 'flex', gap: 4, zIndex: 2 }}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingLocation(loc); }} style={{ background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}>✎</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteLocation(loc.id); }} style={{ background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="ig-profile-empty">
            <span className="ig-profile-empty-icon"><Icon name="marker" alt="" /></span>
            <h2>{copy.emptyLocationsTitle}</h2>
            <p>{isOwnProfile ? copy.emptyLocationsOwn : copy.emptyLocationsOther}</p>
          </div>
        )
      )}

      {activeTab === 'checkins' && (
        checkins.length ? (
          <div className="ig-profile-grid">
            {checkins.map((chk, index) => (
              <div key={`${chk.location.id}-${index}`} className="ig-profile-post-wrapper">
                <button className="ig-profile-post" type="button" onClick={() => onNavigateToDetail(chk.location.id)}>
                  <div className="ig-profile-post-fallback" style={{ background: 'linear-gradient(135deg, #107c10, #8bc34a)' }}>
                    <Icon name="thumbtack" alt="" className="profile-grid-picture-icon" style={{ fill: 'white' }} />
                    <strong style={{ color: 'white' }}>{chk.location.name}</strong>
                  </div>
                  <span className="ig-profile-post-overlay">
                    <strong>{new Date(chk.time).toLocaleDateString('vi-VN')}</strong>
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="ig-profile-empty">
            <span className="ig-profile-empty-icon"><Icon name="thumbtack" alt="" /></span>
            <h2>{copy.emptyCheckins}</h2>
          </div>
        )
      )}

      {activeTab === 'collections' && (
        collections.length ? (
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', padding: '16px 0' }}>
            {collections.map(col => (
              <div key={col.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>{col.title}</h3>
                {col.locations?.length > 0 ? (
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#666' }}>
                    {col.locations.map(loc => (
                      <li key={loc.id}>
                        <button onClick={() => onNavigateToDetail(loc.id)} style={{ border: 'none', background: 'none', color: '#f58529', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                          {loc.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>Trống</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="ig-profile-empty">
            <span className="ig-profile-empty-icon"><Icon name="bookmark" alt="" /></span>
            <h2>{copy.emptyCollections}</h2>
          </div>
        )
      )}

      {connectionType && (
        <div className="profile-connections-backdrop" onMouseDown={() => setConnectionType(null)}>
          <section className="profile-connections-card" role="dialog" aria-modal="true"
            aria-labelledby="profile-connections-title" onMouseDown={event => event.stopPropagation()}>
            <header className="profile-connections-header">
              <h2 id="profile-connections-title">
                {connectionType === 'followers' ? copy.followersTitle : copy.followingTitle}
              </h2>
              <button type="button" className="profile-connections-close" onClick={() => setConnectionType(null)}
                aria-label={copy.close}>&times;</button>
            </header>
            <div className="profile-connections-search">
              <Icon name="search" alt="" />
              <input type="search" value={connectionQuery} placeholder={copy.searchPeople}
                onChange={event => setConnectionQuery(event.target.value)} autoFocus />
            </div>
            {connectionError && <div className="profile-connections-error" role="alert">{connectionError}</div>}
            <div className="profile-connections-list">
              {connectionLoading ? (
                <div className="profile-connections-status">
                  <span className="profile-loading-ring" />
                  <p>{copy.loadingPeople}</p>
                </div>
              ) : filteredConnectionUsers.length ? filteredConnectionUsers.map(connectionUser => (
                <div className="profile-connection-row" key={connectionUser.id}>
                  <button className="profile-connection-person" type="button"
                    onClick={() => openConnectionProfile(connectionUser.id)}>
                    <span className="profile-connection-avatar">
                      {connectionUser.avatar
                        ? <img src={connectionUser.avatar} alt="" />
                        : getUserInitial(connectionUser)}
                    </span>
                    <span className="profile-connection-identity">
                      <strong>{getUserDisplayName(connectionUser)}</strong>
                      <small>@{connectionUser.userName}</small>
                    </span>
                  </button>
                  {viewer?.id !== connectionUser.id && (
                    <button type="button"
                      className={'profile-connection-follow' + (connectionUser.followedByViewer ? ' following' : '')}
                      disabled={connectionPending.has(connectionUser.id)}
                      onClick={() => toggleConnectionFollow(connectionUser)}>
                      {connectionUser.followedByViewer ? copy.following : copy.follow}
                    </button>
                  )}
                </div>
              )) : (
                <div className="profile-connections-status">
                  <p>{connectionQuery
                    ? copy.noSearchResults
                    : connectionType === 'followers' ? copy.emptyFollowers : copy.emptyFollowing}</p>
                </div>
              )}
            </div>
          </section>
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
                <span>Tên người dùng LocalFood</span>
                <input name="userName" placeholder="Ví dụ: foodie_hanoi" minLength={3} maxLength={50}
                  pattern="[A-Za-zÀ-ỹ0-9._-]+" required value={editForm.userName}
                  onChange={e => setEditForm({ ...editForm, userName: e.target.value })} />
                <small>Định danh duy nhất của bạn, được hiển thị dưới dạng @username.</small>
              </label>

              <label className="auth-field">
                <span>Tên hiển thị</span>
                <input name="fullName" placeholder="Ví dụ: Nguyễn Văn A" maxLength={100}
                  value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
                <small>Tên này được ưu tiên trên bài viết, gợi ý bạn bè, chat và trang cá nhân.</small>
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

      {editingPost && (
        <EditPostModal
          currentUser={viewer}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onUpdated={(updatedPost) => {
            setProfile(prev => ({
              ...prev,
              posts: prev.posts.map(p => p.id === updatedPost.id ? updatedPost : p)
            }));
            setEditingPost(null);
          }}
        />
      )}

      {editingLocation && (
        <EditLocationModal
          currentUser={viewer}
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onUpdated={(updatedLoc) => {
            setLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
            setEditingLocation(null);
          }}
        />
      )}
    </section>
  );
}
