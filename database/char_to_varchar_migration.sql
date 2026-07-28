-- Migration: Convert all CHAR(36) UUID columns to VARCHAR(36) to match Hibernate entity mappings.
-- Drops all FK constraints first, changes column types, then recreates FK constraints.
-- Run once against the doiquadi database. Take a backup first!

-- =========================================================
-- STEP 1: Drop all foreign key constraints
-- =========================================================
ALTER TABLE checkins         DROP FOREIGN KEY checkins_ibfk_1;
ALTER TABLE checkins         DROP FOREIGN KEY checkins_ibfk_2;
ALTER TABLE collections      DROP FOREIGN KEY collections_ibfk_1;
ALTER TABLE collection_items DROP FOREIGN KEY collection_items_ibfk_1;
ALTER TABLE collection_items DROP FOREIGN KEY collection_items_ibfk_2;
ALTER TABLE comments         DROP FOREIGN KEY comments_ibfk_1;
ALTER TABLE comments         DROP FOREIGN KEY comments_ibfk_2;
ALTER TABLE favorites        DROP FOREIGN KEY favorites_ibfk_1;
ALTER TABLE favorites        DROP FOREIGN KEY favorites_ibfk_2;
ALTER TABLE follows          DROP FOREIGN KEY follows_ibfk_1;
ALTER TABLE follows          DROP FOREIGN KEY follows_ibfk_2;
ALTER TABLE likes            DROP FOREIGN KEY likes_ibfk_1;
ALTER TABLE likes            DROP FOREIGN KEY likes_ibfk_2;
ALTER TABLE location_foods   DROP FOREIGN KEY location_foods_ibfk_1;
ALTER TABLE location_foods   DROP FOREIGN KEY location_foods_ibfk_2;
ALTER TABLE location_images  DROP FOREIGN KEY FK10mqrg01s8jam7j9x6wfo02ix;
ALTER TABLE notifications    DROP FOREIGN KEY notifications_ibfk_1;
ALTER TABLE oauth_accounts   DROP FOREIGN KEY fk_oauth_account_user;
ALTER TABLE oauth_login_codes DROP FOREIGN KEY fk_oauth_login_code_user;
ALTER TABLE posts             DROP FOREIGN KEY posts_ibfk_1;
ALTER TABLE posts             DROP FOREIGN KEY posts_ibfk_2;
ALTER TABLE post_images       DROP FOREIGN KEY post_images_ibfk_1;
ALTER TABLE post_tags         DROP FOREIGN KEY post_tags_ibfk_1;
ALTER TABLE post_tags         DROP FOREIGN KEY post_tags_ibfk_2;
ALTER TABLE user_roles        DROP FOREIGN KEY fk_user_roles_user;

-- =========================================================
-- STEP 2: Convert all CHAR(36) columns to VARCHAR(36)
-- =========================================================

-- Primary key tables (referenced by others)
ALTER TABLE users         MODIFY COLUMN id           VARCHAR(36) NOT NULL,
                          MODIFY COLUMN auth_subject  VARCHAR(36) NOT NULL;
ALTER TABLE locations     MODIFY COLUMN id            VARCHAR(36) NOT NULL;
ALTER TABLE foods         MODIFY COLUMN id            VARCHAR(36) NOT NULL;
ALTER TABLE posts         MODIFY COLUMN id            VARCHAR(36) NOT NULL,
                          MODIFY COLUMN user_id        VARCHAR(36) NOT NULL,
                          MODIFY COLUMN location_id    VARCHAR(36);
ALTER TABLE collections   MODIFY COLUMN id            VARCHAR(36) NOT NULL,
                          MODIFY COLUMN user_id        VARCHAR(36) NOT NULL;

-- FK-only tables
ALTER TABLE user_roles       MODIFY COLUMN user_id        VARCHAR(36) NOT NULL;
ALTER TABLE checkins         MODIFY COLUMN user_id        VARCHAR(36) NOT NULL,
                             MODIFY COLUMN location_id    VARCHAR(36) NOT NULL;
ALTER TABLE favorites        MODIFY COLUMN user_id        VARCHAR(36) NOT NULL,
                             MODIFY COLUMN location_id    VARCHAR(36) NOT NULL;
ALTER TABLE follows          MODIFY COLUMN follower_id    VARCHAR(36) NOT NULL,
                             MODIFY COLUMN following_id   VARCHAR(36) NOT NULL;
ALTER TABLE likes            MODIFY COLUMN user_id        VARCHAR(36) NOT NULL,
                             MODIFY COLUMN post_id        VARCHAR(36) NOT NULL;
ALTER TABLE comments         MODIFY COLUMN user_id        VARCHAR(36) NOT NULL,
                             MODIFY COLUMN post_id        VARCHAR(36) NOT NULL;
ALTER TABLE post_images      MODIFY COLUMN post_id        VARCHAR(36) NOT NULL;
ALTER TABLE post_tags        MODIFY COLUMN post_id        VARCHAR(36) NOT NULL;
ALTER TABLE collection_items MODIFY COLUMN collection_id  VARCHAR(36) NOT NULL,
                             MODIFY COLUMN location_id    VARCHAR(36) NOT NULL;
ALTER TABLE location_foods   MODIFY COLUMN location_id    VARCHAR(36) NOT NULL,
                             MODIFY COLUMN food_id        VARCHAR(36) NOT NULL;
ALTER TABLE location_images  MODIFY COLUMN location_id    VARCHAR(36);
ALTER TABLE notifications    MODIFY COLUMN receiver_id    VARCHAR(36) NOT NULL;
ALTER TABLE oauth_accounts   MODIFY COLUMN user_id        VARCHAR(36) NOT NULL;
ALTER TABLE oauth_login_codes MODIFY COLUMN user_id       VARCHAR(36) NOT NULL;

-- =========================================================
-- STEP 3: Recreate foreign key constraints
-- =========================================================
ALTER TABLE user_roles        ADD CONSTRAINT fk_user_roles_user           FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE checkins          ADD CONSTRAINT checkins_ibfk_1               FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE checkins          ADD CONSTRAINT checkins_ibfk_2               FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE CASCADE;
ALTER TABLE collections       ADD CONSTRAINT collections_ibfk_1            FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE collection_items  ADD CONSTRAINT collection_items_ibfk_1       FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
ALTER TABLE collection_items  ADD CONSTRAINT collection_items_ibfk_2       FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE CASCADE;
ALTER TABLE comments          ADD CONSTRAINT comments_ibfk_1               FOREIGN KEY (post_id)       REFERENCES posts(id)      ON DELETE CASCADE;
ALTER TABLE comments          ADD CONSTRAINT comments_ibfk_2               FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE favorites         ADD CONSTRAINT favorites_ibfk_1              FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE favorites         ADD CONSTRAINT favorites_ibfk_2              FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE CASCADE;
ALTER TABLE follows           ADD CONSTRAINT follows_ibfk_1                FOREIGN KEY (follower_id)   REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE follows           ADD CONSTRAINT follows_ibfk_2                FOREIGN KEY (following_id)  REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE likes             ADD CONSTRAINT likes_ibfk_1                  FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE likes             ADD CONSTRAINT likes_ibfk_2                  FOREIGN KEY (post_id)       REFERENCES posts(id)      ON DELETE CASCADE;
ALTER TABLE location_foods    ADD CONSTRAINT location_foods_ibfk_1         FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE CASCADE;
ALTER TABLE location_foods    ADD CONSTRAINT location_foods_ibfk_2         FOREIGN KEY (food_id)       REFERENCES foods(id)      ON DELETE CASCADE;
ALTER TABLE location_images   ADD CONSTRAINT FK10mqrg01s8jam7j9x6wfo02ix  FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE CASCADE;
ALTER TABLE notifications     ADD CONSTRAINT notifications_ibfk_1          FOREIGN KEY (receiver_id)   REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE oauth_accounts    ADD CONSTRAINT fk_oauth_account_user         FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE oauth_login_codes ADD CONSTRAINT fk_oauth_login_code_user      FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE posts             ADD CONSTRAINT posts_ibfk_1                  FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE;
ALTER TABLE posts             ADD CONSTRAINT posts_ibfk_2                  FOREIGN KEY (location_id)   REFERENCES locations(id)  ON DELETE SET NULL;
ALTER TABLE post_images       ADD CONSTRAINT post_images_ibfk_1            FOREIGN KEY (post_id)       REFERENCES posts(id)      ON DELETE CASCADE;
ALTER TABLE post_tags         ADD CONSTRAINT post_tags_ibfk_1              FOREIGN KEY (post_id)       REFERENCES posts(id)      ON DELETE CASCADE;

SELECT 'Migration completed successfully: all CHAR(36) converted to VARCHAR(36)' AS status;
