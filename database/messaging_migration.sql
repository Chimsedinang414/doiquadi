-- Messaging feature migration
-- Run this script after the base localfood.sql schema is in place.

-- 16. Conversation
CREATE TABLE conversations (
    id CHAR(36) PRIMARY KEY,
    type ENUM('DIRECT', 'GROUP') NOT NULL,
    name VARCHAR(100),
    avatar_url VARCHAR(500),
    creator_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER before_insert_conversations
BEFORE INSERT ON conversations
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());

-- 17. Conversation Member
CREATE TABLE conversation_members (
    conversation_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    nickname VARCHAR(50),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP NULL,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 18. Message
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY,
    conversation_id CHAR(36) NOT NULL,
    sender_id CHAR(36) NOT NULL,
    content TEXT,
    image_url VARCHAR(1000),
    type ENUM('TEXT', 'IMAGE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_messages_conversation_time (conversation_id, created_at)
);

CREATE TRIGGER before_insert_messages
BEFORE INSERT ON messages
FOR EACH ROW
SET NEW.id = COALESCE(NULLIF(NEW.id, ''), UUID());
