
-- 1. User
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    auth_subject CHAR(36) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    suspended_until DATETIME(6),
    moderation_reason VARCHAR(500),
    warning_count INT NOT NULL DEFAULT 0,
    credentials_version INT NOT NULL DEFAULT 0,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID()),
    NEW.auth_subject = COALESCE(NULLIF(NEW.auth_subject, ''), UUID());

CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(32) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    email_at_provider VARCHAR(254),
    user_id CHAR(36) NOT NULL,
    linked_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT uk_oauth_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uk_oauth_user_provider UNIQUE (user_id, provider),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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


-- 2. Location
CREATE TABLE locations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    latitude DOUBLE,
    longitude DOUBLE,
    open_time TIME,
    close_time TIME,
    phone VARCHAR(20),
    avg_price DECIMAL(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    moderation_reason VARCHAR(500)
);

CREATE TRIGGER before_insert_locations
BEFORE INSERT ON locations
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- 3. Post
CREATE TABLE posts (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    location_id CHAR(36),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    rating FLOAT CHECK (rating >= 0 AND rating <= 5),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    moderation_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
);
CREATE TRIGGER before_insert_posts
BEFORE INSERT ON posts
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- 4. PostImage
CREATE TABLE post_images (
    id CHAR(36) PRIMARY KEY,
    post_id CHAR(36) NOT NULL,
    storage_key VARCHAR(1024),
    image_url VARCHAR(1000) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TRIGGER before_insert_post_images
BEFORE INSERT ON post_images
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

CREATE TABLE location_images (
    id CHAR(36) PRIMARY KEY,
    location_id CHAR(36) NOT NULL,
    storage_key VARCHAR(1024),
    image_url VARCHAR(1000) NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TRIGGER before_insert_location_images
BEFORE INSERT ON location_images
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- 5. Food
CREATE TABLE foods (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    moderation_reason VARCHAR(500)
);

CREATE TRIGGER before_insert_foods
BEFORE INSERT ON foods
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());


-- 6. LocationFood
CREATE TABLE location_foods (
    location_id CHAR(36) NOT NULL,
    food_id CHAR(36) NOT NULL,
    PRIMARY KEY (location_id, food_id),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);


-- 7. Tag
CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 8. PostTag
CREATE TABLE post_tags (
    post_id CHAR(36) NOT NULL,
    tag_id INT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 9. Comment
CREATE TABLE comments (
    id CHAR(36) PRIMARY KEY,
    post_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    moderation_reason VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER before_insert_comments
BEFORE INSERT ON comments
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- 10. Like
CREATE TABLE likes (
    user_id CHAR(36) NOT NULL,
    post_id CHAR(36) NOT NULL,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- 11. Follow
CREATE TABLE follows (
    follower_id CHAR(36) NOT NULL,
    following_id CHAR(36) NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (follower_id != following_id)
);

-- 12. Favorite
CREATE TABLE favorites (
    user_id CHAR(36) NOT NULL,
    location_id CHAR(36) NOT NULL,
    PRIMARY KEY (user_id, location_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 13. Checkin
CREATE TABLE checkins (
    user_id CHAR(36) NOT NULL,
    location_id CHAR(36) NOT NULL,
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, location_id, time),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 14. Collection
CREATE TABLE collections (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- CollectionItem
CREATE TABLE collection_items (
    collection_id CHAR(36) NOT NULL,
    location_id CHAR(36) NOT NULL,
    PRIMARY KEY (collection_id, location_id),
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- 15. Notification
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    receiver_id CHAR(36) NOT NULL,
    type ENUM('LIKE_POST', 'COMMENT', 'FOLLOW', 'CHECKIN') NOT NULL,
    reference_id CHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER before_insert_notifications
BEFORE INSERT ON notifications
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- Admin audit trail. Administrator accounts still use the normal users/user_roles tables.
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

CREATE TABLE reports (
    id CHAR(36) PRIMARY KEY,
    reporter_id CHAR(36) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_admin_id CHAR(36),
    resolution_note TEXT,
    resolution_action VARCHAR(20),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    resolved_at DATETIME(6),
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_violations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    admin_id CHAR(36) NOT NULL,
    action VARCHAR(20) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    expires_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);
