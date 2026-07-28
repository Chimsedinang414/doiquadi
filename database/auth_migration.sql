-- Run once against an existing LocalFood database before starting the secured backend.
-- Take a backup first; MySQL DDL auto-commits.

ALTER TABLE users
    ADD COLUMN auth_subject CHAR(36) NULL AFTER id,
    MODIFY COLUMN email VARCHAR(254) NOT NULL,
    MODIFY COLUMN password_hash VARCHAR(255) NULL,
    ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER password_hash,
    ADD COLUMN credentials_version INT NOT NULL DEFAULT 0 AFTER enabled;

UPDATE users SET auth_subject = UUID() WHERE auth_subject IS NULL;

ALTER TABLE users
    MODIFY COLUMN auth_subject CHAR(36) NOT NULL,
    ADD CONSTRAINT uk_users_auth_subject UNIQUE (auth_subject);

CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO user_roles (user_id, role)
SELECT id, 'USER' FROM users;

CREATE TABLE oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email_at_provider VARCHAR(254),
    user_id CHAR(36) NOT NULL,
    linked_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_oauth_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uk_oauth_user_provider UNIQUE (user_id, provider),
    CONSTRAINT fk_oauth_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE oauth_link_intents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_oauth_link_intent_expiry (expires_at),
    CONSTRAINT fk_oauth_link_intent_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE oauth_login_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    INDEX idx_oauth_login_code_expiry (expires_at),
    CONSTRAINT fk_oauth_login_code_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id CHAR(36) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_password_reset_expiry (expires_at),
    INDEX idx_password_reset_user_created (user_id, created_at),
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admin_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id CHAR(36),
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(64) NOT NULL,
    target_id VARCHAR(255),
    details TEXT,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_admin_audit_created (created_at),
    INDEX idx_admin_audit_actor (actor_user_id),
    CONSTRAINT fk_admin_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);
