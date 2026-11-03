-- V3: profile skill list, investor sector/stage/portfolio, connection, post, like tables
-- NOTE: refresh_tokens, one_time_tokens, media_assets, profiles, investor_profiles,
--       companies, jobs, applications, posts, connections, post_likes
--       are created by Hibernate schema generation (spring.jpa.hibernate.ddl-auto=update in dev)
--       This migration handles production-mode DDL for any supplementary tables.

-- ── Profile skill collection table ─────────────────────────────
CREATE TABLE IF NOT EXISTS profile_skills (
    profile_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    skill           VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_user_id, skill)
);

-- ── Investor profile collections ────────────────────────────────
CREATE TABLE IF NOT EXISTS investor_sectors (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    sector           VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS investor_stages (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    stage            VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS investor_portfolio (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    company_name     VARCHAR(200) NOT NULL
);

-- ── GIN index for post body full-text search ────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_body_fts
    ON posts USING gin(to_tsvector('english', body));

-- ── Partial index for open connections ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_connections_pending
    ON connections(addressee_id)
    WHERE status = 'PENDING';

-- ── Index for feed queries ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_author_created
    ON posts(author_id, created_at DESC)
    WHERE deleted_at IS NULL;
