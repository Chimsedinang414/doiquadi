CREATE TABLE oauth_accounts
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    provider          VARCHAR(32)  NOT NULL,
    provider_subject  VARCHAR(255) NOT NULL,
    email_at_provider VARCHAR(254) NULL,
    user_id           VARCHAR(36)  NOT NULL,
    linked_at         datetime     NOT NULL,
    CONSTRAINT pk_oauth_accounts PRIMARY KEY (id)
);

CREATE TABLE oauth_login_codes
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    code_hash   VARCHAR(64) NOT NULL,
    user_id     VARCHAR(36) NOT NULL,
    expires_at  datetime    NOT NULL,
    consumed_at datetime NULL,
    CONSTRAINT pk_oauth_login_codes PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    user_id VARCHAR(36) NOT NULL,
    `role`  VARCHAR(32) NOT NULL
);

ALTER TABLE users
    ADD auth_subject VARCHAR(36) NULL;

ALTER TABLE users
    ADD credentials_version INT NULL;

ALTER TABLE users
    ADD enabled BIT(1) NULL;

ALTER TABLE users
    MODIFY auth_subject VARCHAR (36) NOT NULL;

ALTER TABLE users
    MODIFY credentials_version INT NOT NULL;

ALTER TABLE users
    MODIFY enabled BIT (1) NOT NULL;

ALTER TABLE oauth_login_codes
    ADD CONSTRAINT uc_oauth_login_codes_code_hash UNIQUE (code_hash);

ALTER TABLE users
    ADD CONSTRAINT uc_users_auth_subject UNIQUE (auth_subject);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT uk_oauth_provider_subject UNIQUE (provider, provider_subject);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT uk_oauth_user_provider UNIQUE (user_id, provider);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT FK_OAUTH_ACCOUNTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE oauth_login_codes
    ADD CONSTRAINT FK_OAUTH_LOGIN_CODES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_on_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE users
    MODIFY email VARCHAR (254);

ALTER TABLE post_images
    MODIFY image_url VARCHAR (1000);

ALTER TABLE notifications
    MODIFY is_read BIT (1) NOT NULL;

ALTER TABLE users
    MODIFY password_hash VARCHAR (255) NULL;
CREATE TABLE oauth_accounts
(
    id                BIGINT AUTO_INCREMENT NOT NULL,
    provider          VARCHAR(32)           NOT NULL,
    provider_subject  VARCHAR(255)          NOT NULL,
    email_at_provider VARCHAR(254)          NULL,
    user_id           VARCHAR(36)           NOT NULL,
    linked_at         datetime              NOT NULL,
    CONSTRAINT pk_oauth_accounts PRIMARY KEY (id)
);

CREATE TABLE oauth_login_codes
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    code_hash   VARCHAR(64)           NOT NULL,
    user_id     VARCHAR(36)           NOT NULL,
    expires_at  datetime              NOT NULL,
    consumed_at datetime              NULL,
    CONSTRAINT pk_oauth_login_codes PRIMARY KEY (id)
);

CREATE TABLE user_roles
(
    user_id VARCHAR(36) NOT NULL,
    `role`  VARCHAR(32) NOT NULL
);

ALTER TABLE users
    ADD auth_subject VARCHAR(36) NULL;

ALTER TABLE users
    ADD credentials_version INT NULL;

ALTER TABLE users
    ADD enabled BIT(1) NULL;

ALTER TABLE users
    MODIFY auth_subject VARCHAR(36) NOT NULL;

ALTER TABLE users
    MODIFY credentials_version INT NOT NULL;

ALTER TABLE users
    MODIFY enabled BIT(1) NOT NULL;

ALTER TABLE oauth_login_codes
    ADD CONSTRAINT uc_oauth_login_codes_code_hash UNIQUE (code_hash);

ALTER TABLE users
    ADD CONSTRAINT uc_users_auth_subject UNIQUE (auth_subject);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT uk_oauth_provider_subject UNIQUE (provider, provider_subject);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT uk_oauth_user_provider UNIQUE (user_id, provider);

ALTER TABLE oauth_accounts
    ADD CONSTRAINT FK_OAUTH_ACCOUNTS_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE oauth_login_codes
    ADD CONSTRAINT FK_OAUTH_LOGIN_CODES_ON_USER FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_on_user FOREIGN KEY (user_id) REFERENCES users (id);

ALTER TABLE users
    MODIFY email VARCHAR(254);

ALTER TABLE post_images
    MODIFY image_url VARCHAR(1000);

ALTER TABLE notifications
    MODIFY is_read BIT(1) NOT NULL;

ALTER TABLE users
    MODIFY password_hash VARCHAR(255) NULL;