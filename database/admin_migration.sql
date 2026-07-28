-- The application creates admin_audit_logs automatically through its idempotent initializer.
-- Use this file for a manual deployment or to bootstrap the first administrator.

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id VARCHAR(36),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(255),
    details TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_admin_audit_created (created_at),
    INDEX idx_admin_audit_actor (actor_user_id),
    CONSTRAINT fk_admin_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Replace the sentinel email before running this statement. It intentionally matches no valid account.
-- Force existing sessions to refresh only when this promotion is new.
UPDATE users u
SET u.credentials_version = u.credentials_version + 1
WHERE u.email = 'nanhquan831@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'ADMIN'
  );

INSERT IGNORE INTO user_roles (user_id, role)
SELECT id, 'ADMIN'
FROM users
WHERE email = 'nanhquan831@gmail.com';
