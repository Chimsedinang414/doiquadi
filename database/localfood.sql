
-- 1. User
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());


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
    avg_price DECIMAL(10, 2)
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
    image_url VARCHAR(500)
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
