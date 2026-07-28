CREATE TABLE IF NOT EXISTS reports (
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

CREATE TABLE IF NOT EXISTS user_violations (
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
