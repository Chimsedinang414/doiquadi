-- Run once for databases that already have the original OAuth tables.
-- Back up production data first; MySQL DDL auto-commits.

CREATE TABLE oauth_link_intents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    user_id VARCHAR(36) NOT NULL,
    provider VARCHAR(32) NOT NULL,
    expires_at DATETIME(6) NOT NULL,
    consumed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_oauth_link_intent_expiry (expires_at),
    CONSTRAINT fk_oauth_link_intent_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
