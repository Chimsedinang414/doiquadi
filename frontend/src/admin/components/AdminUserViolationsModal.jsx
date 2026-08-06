import React, { useEffect, useState } from 'react';
import { Clock3, ShieldAlert, UserRound } from 'lucide-react';
import { getUserDisplayName } from '../../utils/userDisplay';
import { adminApi } from '../services/adminApi';
import { AdminEmpty, AdminError, AdminLoading } from './AdminState';
import AdminModal from './AdminModal';

const ACTION_LABELS = {
  WARNING: 'Cảnh báo',
  SUSPENDED: 'Tạm khóa',
  BANNED: 'Khóa vĩnh viễn',
  ACTIVE: 'Mở khóa',
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

function badgeClass(action) {
  if (action === 'WARNING') return 'warning';
  if (action === 'ACTIVE') return 'success';
  return 'danger';
}

export default function AdminUserViolationsModal({ user, onClose }) {
  const [violations, setViolations] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setViolations(null);
    setError('');
    adminApi.getUserViolations(user.id)
      .then(data => active && setViolations(data))
      .catch(requestError => active && setError(requestError.message));
    return () => { active = false; };
  }, [user.id, version]);

  return (
    <AdminModal title={`Lịch sử của ${getUserDisplayName(user)}`}
      eyebrow="LỊCH SỬ KIỂM DUYỆT" onClose={onClose} size="wide">
      <div className="admin-violation-summary">
        <div><UserRound size={18} /><span>Tài khoản<strong>@{user.userName}</strong></span></div>
        <div><ShieldAlert size={18} /><span>Số cảnh báo<strong>{user.warningCount || 0}</strong></span></div>
        <div><Clock3 size={18} /><span>Trạng thái<strong>{user.status}</strong></span></div>
      </div>

      {!violations && !error && <AdminLoading />}
      {error && <AdminError message={error} onRetry={() => setVersion(value => value + 1)} />}
      {violations?.length === 0 && <AdminEmpty>Người dùng này chưa có lịch sử vi phạm.</AdminEmpty>}
      {violations?.length > 0 && (
        <ol className="admin-violation-list">
          {violations.map(violation => (
            <li key={violation.id}>
              <span className={`admin-violation-marker ${badgeClass(violation.action)}`} />
              <div className="admin-violation-card">
                <header>
                  <span className={`admin-badge ${badgeClass(violation.action)}`}>
                    {ACTION_LABELS[violation.action] || violation.action}
                  </span>
                  <time dateTime={violation.createdAt}>{formatDate(violation.createdAt)}</time>
                </header>
                <p>{violation.reason || 'Không ghi nhận lý do.'}</p>
                <footer>
                  <span>Thực hiện bởi <strong>{violation.adminUserName || 'Hệ thống'}</strong></span>
                  {violation.expiresAt && <span>Hết hạn <strong>{formatDate(violation.expiresAt)}</strong></span>}
                </footer>
              </div>
            </li>
          ))}
        </ol>
      )}
    </AdminModal>
  );
}
