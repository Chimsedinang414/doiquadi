import React, { useEffect, useState } from 'react';
import { AlertTriangle, FileText, MapPin, MessageSquare, UserRound } from 'lucide-react';
import { getUserDisplayName } from '../../utils/userDisplay';
import { adminApi } from '../services/adminApi';
import { AdminError, AdminLoading } from './AdminState';
import AdminModal from './AdminModal';

const TARGET_CONFIG = {
  USER: { label: 'người dùng', icon: UserRound, load: id => adminApi.getUser(id) },
  POST: { label: 'bài viết', icon: FileText, load: id => adminApi.getPost(id) },
  COMMENT: { label: 'bình luận', icon: MessageSquare, load: id => adminApi.getComment(id) },
  LOCATION: { label: 'địa điểm', icon: MapPin, load: id => adminApi.getLocation(id) },
  REVIEW: { label: 'đánh giá', icon: MessageSquare },
  MEDIA: { label: 'tệp phương tiện', icon: FileText },
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('vi-VN');
}

function badgeClass(status) {
  if (['ACTIVE', 'VERIFIED'].includes(status)) return 'success';
  if (['WARNING', 'PENDING', 'UNDER_REVIEW'].includes(status)) return 'warning';
  return 'danger';
}

function Detail({ label, children, wide = false }) {
  return <div className={`admin-preview-detail${wide ? ' wide' : ''}`}><dt>{label}</dt><dd>{children ?? '—'}</dd></div>;
}

function Status({ value }) {
  return value ? <span className={`admin-badge ${badgeClass(value)}`}>{value}</span> : '—';
}

function UserPreview({ data }) {
  return <>
    <div className="admin-preview-hero">
      <span className="admin-preview-avatar">{(data.fullName || data.userName || 'U').charAt(0).toUpperCase()}</span>
      <div><h3>{getUserDisplayName(data)}</h3><p>@{data.userName} · {data.email}</p></div>
      <Status value={data.status} />
    </div>
    <dl className="admin-preview-details">
      <Detail label="Vai trò"><div className="admin-preview-roles">{[...(data.roles || [])].map(role => <span className="admin-role" key={role}>{role}</span>)}</div></Detail>
      <Detail label="Số cảnh báo">{formatNumber(data.warningCount)}</Detail>
      <Detail label="Bị tạm khóa đến">{formatDate(data.suspendedUntil)}</Detail>
      <Detail label="Ngày tham gia">{formatDate(data.createdAt)}</Detail>
      <Detail label="Hoạt động" wide>{formatNumber(data.postsCount)} bài viết · {formatNumber(data.followersCount)} follower · {formatNumber(data.followingCount)} following</Detail>
      {data.moderationReason && <Detail label="Lý do kiểm duyệt" wide>{data.moderationReason}</Detail>}
    </dl>
  </>;
}

function PostPreview({ data }) {
  return <>
    <div className="admin-preview-hero compact">
      <FileText size={24} />
      <div><h3>{data.title || 'Bài viết không có tiêu đề'}</h3><p>Bởi @{data.authorUserName || data.authorId}</p></div>
      <Status value={data.status} />
    </div>
    <div className="admin-preview-content">{data.content || 'Bài viết không có nội dung văn bản.'}</div>
    <dl className="admin-preview-details">
      <Detail label="Địa điểm">{data.locationName}</Detail>
      <Detail label="Đánh giá">{data.rating == null ? '—' : `${data.rating}/5`}</Detail>
      <Detail label="Số báo cáo">{formatNumber(data.reportCount)}</Detail>
      <Detail label="Ngày đăng">{formatDate(data.createdAt)}</Detail>
      {data.moderationReason && <Detail label="Lý do kiểm duyệt" wide>{data.moderationReason}</Detail>}
    </dl>
    <p className="admin-preview-notice">API Admin hiện chỉ cung cấp nội dung văn bản, chưa cung cấp ảnh của bài viết.</p>
  </>;
}

function CommentPreview({ data }) {
  return <>
    <div className="admin-preview-hero compact">
      <MessageSquare size={24} />
      <div><h3>Bình luận của @{data.authorUserName || data.authorId}</h3><p>Trong bài viết: {data.postTitle || data.postId}</p></div>
      <Status value={data.status} />
    </div>
    <blockquote className="admin-preview-content">{data.content || 'Bình luận không có nội dung.'}</blockquote>
    <dl className="admin-preview-details">
      <Detail label="Mã bài viết"><code>{data.postId}</code></Detail>
      <Detail label="Số báo cáo">{formatNumber(data.reportCount)}</Detail>
      <Detail label="Ngày đăng">{formatDate(data.createdAt)}</Detail>
      {data.moderationReason && <Detail label="Lý do kiểm duyệt" wide>{data.moderationReason}</Detail>}
    </dl>
  </>;
}

function LocationPreview({ data }) {
  return <>
    <div className="admin-preview-hero compact">
      <MapPin size={24} />
      <div><h3>{data.name || 'Địa điểm chưa đặt tên'}</h3><p>{data.address || 'Chưa có địa chỉ'}</p></div>
      <Status value={data.status} />
    </div>
    <dl className="admin-preview-details">
      <Detail label="Số điện thoại">{data.phone}</Detail>
      <Detail label="Giá trung bình">{data.averagePrice == null ? '—' : `${formatNumber(data.averagePrice)} ₫`}</Detail>
      <Detail label="Tọa độ">{data.latitude == null ? '—' : `${data.latitude}, ${data.longitude}`}</Detail>
      <Detail label="Số báo cáo">{formatNumber(data.reportCount)}</Detail>
      {data.moderationReason && <Detail label="Lý do kiểm duyệt" wide>{data.moderationReason}</Detail>}
    </dl>
  </>;
}

function PreviewContent({ targetType, data }) {
  if (targetType === 'USER') return <UserPreview data={data} />;
  if (targetType === 'POST') return <PostPreview data={data} />;
  if (targetType === 'COMMENT') return <CommentPreview data={data} />;
  if (targetType === 'LOCATION') return <LocationPreview data={data} />;
  return null;
}

export default function AdminTargetPreviewModal({ targetType, targetId, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const config = TARGET_CONFIG[targetType] || { label: targetType.toLowerCase(), icon: FileText };
  const TargetIcon = config.icon;

  useEffect(() => {
    if (!config.load) return undefined;
    let active = true;
    setData(null);
    setError('');
    config.load(targetId)
      .then(response => active && setData(response))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [config, targetId, version]);

  return (
    <AdminModal title={`Xem nhanh ${config.label}`} eyebrow="MODERATION QUICK VIEW"
      onClose={onClose} size="wide">
      <div className="admin-preview-identity">
        <TargetIcon size={18} />
        <span>{targetType}</span>
        <code>{targetId}</code>
      </div>

      {!config.load && (
        <div className="admin-preview-unsupported">
          <AlertTriangle size={28} />
          <h3>Chưa hỗ trợ xem nhanh {config.label}</h3>
          <p>Backend chưa cung cấp endpoint Admin để tải loại đối tượng này. Admin vẫn có thể xử lý báo cáo dựa trên thông tin hiện có.</p>
        </div>
      )}
      {config.load && !data && !error && <AdminLoading />}
      {config.load && error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
      {data && <PreviewContent targetType={targetType} data={data} />}
    </AdminModal>
  );
}
