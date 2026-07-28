-- LocalFood Admin MVP migration (run once before starting this version).
-- Back up the database first; MySQL/MariaDB DDL auto-commits.

ALTER TABLE users
    ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER enabled,
    ADD COLUMN suspended_until DATETIME(6) NULL AFTER account_status,
    ADD COLUMN moderation_reason VARCHAR(500) NULL AFTER suspended_until,
    ADD COLUMN warning_count INT NOT NULL DEFAULT 0 AFTER moderation_reason;

ALTER TABLE posts
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER rating,
    ADD COLUMN moderation_reason VARCHAR(500) NULL AFTER status,
    ADD INDEX idx_posts_status_created (status, created_at);

ALTER TABLE comments
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER content,
    ADD COLUMN moderation_reason VARCHAR(500) NULL AFTER status,
    ADD INDEX idx_comments_status_created (status, created_at);

ALTER TABLE locations
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PENDING' AFTER avg_price,
    ADD COLUMN moderation_reason VARCHAR(500) NULL AFTER status,
    ADD INDEX idx_locations_status_name (status, name);

-- Existing locations predate the approval workflow and are treated as trusted.
UPDATE locations SET status = 'VERIFIED';

ALTER TABLE foods
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER image_url,
    ADD COLUMN moderation_reason VARCHAR(500) NULL AFTER status,
    ADD INDEX idx_foods_status_name (status, name);

CREATE TABLE reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_admin_id VARCHAR(36),
    resolution_note TEXT,
    resolution_action VARCHAR(20),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    resolved_at DATETIME(6),
    INDEX idx_reports_queue (status, created_at),
    INDEX idx_reports_target (target_type, target_id),
    INDEX idx_reports_reporter (reporter_id, status),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reports_admin FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_violations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    admin_id VARCHAR(36) NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    expires_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_user_violations_user_created (user_id, created_at),
    CONSTRAINT fk_user_violations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_violations_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Promote the current bootstrap administrator once, then replace this email for deployment.
INSERT IGNORE INTO user_roles (user_id, role)
SELECT id, 'SUPER_ADMIN' FROM users WHERE email = 'nanhquan831@gmail.com';
