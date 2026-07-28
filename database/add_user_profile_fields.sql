-- Migration: Add extended profile fields (fullName, phoneNumber, address, dateOfBirth) to users table
-- Run against doiquadi database

ALTER TABLE users
    ADD COLUMN full_name VARCHAR(100) NULL AFTER username,
    ADD COLUMN phone_number VARCHAR(20) NULL AFTER email,
    ADD COLUMN address VARCHAR(255) NULL AFTER avatar_url,
    ADD COLUMN date_of_birth DATE NULL AFTER address;

SELECT 'Migration add_user_profile_fields completed successfully' AS status;
