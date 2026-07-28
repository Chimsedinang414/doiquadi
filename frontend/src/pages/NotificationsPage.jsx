import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Heart, MapPin, MessageCircle, RefreshCw, UserPlus } from 'lucide-react';
import { api, getCurrentUser } from '../services/api';

const TYPE_META = {
  LIKE_POST: { label: 'Lượt thích mới', description: 'Có người vừa thích bài viết của bạn.', icon: Heart, tone: 'rose' },
  COMMENT: { label: 'Bình luận mới', description: 'Bài viết của bạn vừa nhận được bình luận.', icon: MessageCircle, tone: 'blue' },
  FOLLOW: { label: 'Người theo dõi mới', description: 'Có người vừa bắt đầu theo dõi bạn.', icon: UserPlus, tone: 'teal' },
  CHECKIN: { label: 'Lượt check-in mới', description: 'Địa điểm của bạn vừa có một lượt check-in.', icon: MapPin, tone: 'amber' },
};

function formatRelativeTime(value) {
  const time = new Date(value).getTime();
  if (!Number.isFinite(time)) return '';
  const seconds = Math.round((time - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return 'Vừa xong';
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return formatter.format(days, 'day');
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .format(new Date(time));
}

export default function NotificationsPage() {
  const user = getCurrentUser();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(Boolean(user?.id));
  const [bulkPending, setBulkPending] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(() => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    api.getNotifications(user.id)
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = items.filter(item => !item.read).length;
  const visibleItems = useMemo(
    () => filter === 'unread' ? items.filter(item => !item.read) : items,
    [filter, items],
  );

  const markRead = async item => {
    if (item.read) return;
    try {
      const updated = await api.markNotificationRead(item.id, user.id);
      setItems(previous => previous.map(value => value.id === item.id ? updated : value));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAllRead = async () => {
    const unread = items.filter(item => !item.read);
    if (!unread.length || bulkPending) return;
    setBulkPending(true);
    setError('');
    try {
      const updated = await Promise.all(unread.map(item => api.markNotificationRead(item.id, user.id)));
      const updatedById = new Map(updated.map(item => [item.id, item]));
      setItems(previous => previous.map(item => updatedById.get(item.id) || item));
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkPending(false);
    }
  };

  if (!user) return (
    <section className="notifications-page notifications-signed-out">
      <span className="notifications-empty-icon"><Bell size={30} /></span>
      <h1>Thông báo</h1>
      <p>Bạn cần đăng nhập để xem thông báo.</p>
    </section>
  );

  return (
    <section className="notifications-page">
      <header className="notifications-header">
        <div>
          <span className="notifications-kicker">HOẠT ĐỘNG CỦA BẠN</span>
          <h1>Thông báo {unreadCount > 0 && <em>{unreadCount}</em>}</h1>
          <p>Theo dõi các tương tác mới nhất trong cộng đồng LocalFood.</p>
        </div>
        <button className="notifications-refresh" type="button" onClick={loadNotifications}
          disabled={loading} aria-label="Làm mới thông báo">
          <RefreshCw size={17} className={loading ? 'spinning' : ''} />
          <span>Làm mới</span>
        </button>
      </header>

      <div className="notifications-toolbar">
        <div className="notifications-tabs" role="tablist" aria-label="Lọc thông báo">
          <button type="button" role="tab" aria-selected={filter === 'all'}
            className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Tất cả <span>{items.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={filter === 'unread'}
            className={filter === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>
            Chưa đọc <span>{unreadCount}</span>
          </button>
        </div>
        <button className="notifications-mark-all" type="button" onClick={markAllRead}
          disabled={!unreadCount || bulkPending}>
          <CheckCheck size={17} /> {bulkPending ? 'Đang cập nhật...' : 'Đánh dấu tất cả đã đọc'}
        </button>
      </div>

      {error && <div className="notifications-error" role="alert">{error}</div>}

      <div className="notifications-list" aria-live="polite">
        {loading && items.length === 0 && Array.from({ length: 3 }, (_, index) => (
          <div className="notification-skeleton" key={index}><i /><span /><span /></div>
        ))}

        {!loading && visibleItems.map(item => {
          const meta = TYPE_META[item.type] || {
            label: 'Hoạt động mới', description: 'Bạn có một thông báo mới.', icon: Bell, tone: 'gray',
          };
          const NotificationIcon = meta.icon;
          return (
            <button key={item.id} type="button"
              className={'notification-card' + (item.read ? ' read' : ' unread')}
              onClick={() => markRead(item)}>
              <span className={`notification-type-icon ${meta.tone}`}>
                <NotificationIcon size={21} strokeWidth={1.9} />
              </span>
              <span className="notification-copy">
                <span className="notification-title-row">
                  <strong>{meta.label}</strong>
                  <time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString('vi-VN')}>
                    {formatRelativeTime(item.createdAt)}
                  </time>
                </span>
                <span>{meta.description}</span>
              </span>
              <span className="notification-state" aria-label={item.read ? 'Đã đọc' : 'Chưa đọc'}>
                {item.read ? <Check size={16} /> : <i />}
              </span>
            </button>
          );
        })}

        {!loading && visibleItems.length === 0 && !error && (
          <div className="notifications-empty">
            <span className="notifications-empty-icon"><Bell size={30} /></span>
            <h2>{filter === 'unread' ? 'Bạn đã xem hết thông báo' : 'Chưa có thông báo'}</h2>
            <p>{filter === 'unread'
              ? 'Các thông báo mới sẽ xuất hiện tại đây.'
              : 'Khi có lượt thích, bình luận hoặc người theo dõi mới, bạn sẽ thấy chúng ở đây.'}</p>
          </div>
        )}
      </div>
    </section>
  );
}
