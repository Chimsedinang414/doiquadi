import React, { useEffect, useMemo, useState } from 'react';
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

  const loadProfile = () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    api.getProfile(userId, viewer?.id)
      .then(setProfile)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadProfile, [userId, viewer?.id]);

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
            <h1>{profile.userName}</h1>
            {isOwnProfile ? (
              <button className="profile-neutral-button" type="button" onClick={onSettings}>
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
              <button className="profile-settings-icon" type="button" onClick={onSettings} aria-label={copy.edit}>
                <Icon name="settings" alt="" />
              </button>
            )}
          </div>
          <div className="ig-profile-stats" aria-label={'Th\u1ed1ng k\u00ea trang c\u00e1 nh\u00e2n'}>
            <span><strong>{formatCount(profile.postsCount)}</strong> {copy.posts}</span>
            <span><strong>{formatCount(profile.followersCount)}</strong> {copy.followers}</span>
            <span><strong>{formatCount(profile.followingCount)}</strong> {copy.followingCount}</span>
          </div>
          <div className="ig-profile-bio">
            <strong>{profile.userName}</strong>
            <p>{profile.bio || copy.noBio}</p>
            {joined && <small>{copy.joined} {joined}</small>}
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
    </section>
  );
}

