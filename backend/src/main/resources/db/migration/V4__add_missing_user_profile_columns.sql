-- V4: Add missing columns to users and profiles tables
-- These columns are required by the frontend but were missing from the initial migrations.

-- 1. Add missing columns to 'users' table
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Add missing columns to 'profiles' table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT;

-- 3. Update comments to reflect purpose
COMMENT ON COLUMN users.avatar_url IS 'Mirror of profiles.photo_url for easier joins in feed/nav';
COMMENT ON COLUMN profiles.photo_url IS 'Base64 data URL or external URL for profile photo';
COMMENT ON COLUMN profiles.skills IS 'Comma-separated list of skills for quick display';
