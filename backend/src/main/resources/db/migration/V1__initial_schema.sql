-- V1__initial_schema.sql
-- FounderBridge initial database schema
-- All UUIDs, soft deletes where noted, indexes on every FK and filter column

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================================
-- USERS & AUTH
-- ==============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_handle     VARCHAR(50) UNIQUE NOT NULL,
    email           CITEXT UNIQUE NOT NULL,
    phone           VARCHAR(20),
    phone_encrypted BYTEA,
    password_hash   VARCHAR(255),
    type            VARCHAR(30) NOT NULL CHECK (type IN ('INDIVIDUAL','INVESTOR','STARTUP_FOUNDER','COMPANY_OWNER')),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER','MODERATOR','ADMIN')),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','DELETED')),
    email_verified_at TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_handle ON users(user_handle);
CREATE INDEX idx_users_type ON users(type);
CREATE INDEX idx_users_status ON users(status);

CREATE TABLE auth_identities (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider          VARCHAR(30) NOT NULL CHECK (provider IN ('GOOGLE','LINKEDIN','TWITTER','GITHUB')),
    provider_user_id  VARCHAR(255) NOT NULL,
    provider_email    CITEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_auth_identities_user_id ON auth_identities(user_id);

CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id       UUID NOT NULL,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(255) NOT NULL UNIQUE,
    user_agent      TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    replaced_by     UUID REFERENCES refresh_tokens(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens(family_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

CREATE TABLE one_time_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purpose     VARCHAR(30) NOT NULL CHECK (purpose IN ('EMAIL_VERIFY','PASSWORD_RESET')),
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_one_time_tokens_user_id ON one_time_tokens(user_id);
CREATE INDEX idx_one_time_tokens_token_hash ON one_time_tokens(token_hash);

-- ==============================================================
-- PROFILES
-- ==============================================================

CREATE TABLE profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline        VARCHAR(200),
    bio             TEXT,
    location        VARCHAR(200),
    education       TEXT,
    experience      TEXT,
    interests       TEXT,
    looking_for     TEXT,
    links           TEXT,
    photo_media_id  UUID,
    theme_id        VARCHAR(50),
    public_slug     VARCHAR(100) UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profile_skills (
    profile_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    skill           VARCHAR(100) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (profile_user_id, skill)
);

CREATE TABLE investor_profiles (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    firm            VARCHAR(200),
    ticket_size     VARCHAR(100),
    thesis          TEXT,
    site            VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE investor_sectors (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    sector           VARCHAR(100) NOT NULL,
    PRIMARY KEY (investor_user_id, sector)
);

CREATE TABLE investor_stages (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    stage            VARCHAR(50) NOT NULL,
    PRIMARY KEY (investor_user_id, stage)
);

CREATE TABLE investor_portfolio (
    investor_user_id UUID NOT NULL REFERENCES investor_profiles(user_id) ON DELETE CASCADE,
    company_name     VARCHAR(200) NOT NULL,
    PRIMARY KEY (investor_user_id, company_name)
);

-- ==============================================================
-- MEDIA ASSETS
-- ==============================================================

CREATE TABLE media_assets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bucket_key  VARCHAR(500) NOT NULL UNIQUE,
    mime_type   VARCHAR(100),
    size_bytes  BIGINT,
    width       INT,
    height      INT,
    sha256      VARCHAR(64),
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','READY','FAILED','DELETED')),
    purpose     VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_assets_owner_id ON media_assets(owner_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);

-- ==============================================================
-- COMPANIES
-- ==============================================================

CREATE TABLE companies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id            UUID NOT NULL REFERENCES users(id),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) UNIQUE NOT NULL,
    tagline             VARCHAR(300),
    about               TEXT,
    brand_color         VARCHAR(20),
    website             VARCHAR(500),
    email               CITEXT,
    phone               VARCHAR(30),
    address             TEXT,
    industry            VARCHAR(100) CHECK (industry IN ('Technology','Education','Healthcare','Finance','Retail','Manufacturing','Agriculture','Other')),
    kind                VARCHAR(30) CHECK (kind IN ('STARTUP','ESTABLISHED')),
    founded_year        SMALLINT,
    registration_status VARCHAR(30),
    udyam               VARCHAR(30),
    cin                 VARCHAR(30),
    gst                 VARCHAR(20),
    dpiit               VARCHAR(20),
    vision              TEXT,
    mission             TEXT,
    highlights          JSONB,
    achievements        TEXT,
    fund_round          VARCHAR(50),
    raise_amount        VARCHAR(100),
    theme_id            VARCHAR(50),
    logo_media_id       UUID REFERENCES media_assets(id),
    published_at        TIMESTAMPTZ,
    is_demo             BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_owner_id ON companies(owner_id);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_published_at ON companies(published_at);
CREATE INDEX idx_companies_industry ON companies(industry);

CREATE TABLE company_services (
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service     VARCHAR(200) NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (company_id, service)
);

CREATE TABLE company_team_members (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    role        VARCHAR(200),
    bio         TEXT,
    email       CITEXT,
    photo_media_id UUID REFERENCES media_assets(id),
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_team_members_company_id ON company_team_members(company_id);

CREATE TABLE company_projects (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title       VARCHAR(300) NOT NULL,
    status      VARCHAR(30) CHECK (status IN ('ONGOING','COMPLETED')),
    description TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_company_projects_company_id ON company_projects(company_id);

CREATE TABLE project_media (
    project_id   UUID NOT NULL REFERENCES company_projects(id) ON DELETE CASCADE,
    media_id     UUID NOT NULL REFERENCES media_assets(id),
    sort_order   INT NOT NULL DEFAULT 0,
    PRIMARY KEY (project_id, media_id)
);

CREATE TABLE company_photos (
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    media_id    UUID NOT NULL REFERENCES media_assets(id),
    sort_order  INT NOT NULL DEFAULT 0,
    PRIMARY KEY (company_id, media_id)
);

-- ==============================================================
-- JOBS & APPLICATIONS
-- ==============================================================

CREATE TABLE jobs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title       VARCHAR(300) NOT NULL,
    type        VARCHAR(30) CHECK (type IN ('FULL_TIME','PART_TIME','INTERNSHIP','CONTRACT')),
    location    VARCHAR(200),
    description TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);

CREATE TABLE applications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_user_id UUID REFERENCES users(id),
    name            VARCHAR(200) NOT NULL,
    email           CITEXT NOT NULL,
    role            VARCHAR(200),
    cover_note      TEXT,
    resume_media_id UUID REFERENCES media_assets(id),
    status          VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','SHORTLISTED','INTERVIEW','HIRED','REJECTED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (job_id, email)
);

CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_applicant_user_id ON applications(applicant_user_id);
CREATE INDEX idx_applications_status ON applications(status);

CREATE TABLE application_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    from_status     VARCHAR(30),
    to_status       VARCHAR(30) NOT NULL,
    changed_by      UUID REFERENCES users(id),
    note            TEXT,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_app_status_history_app_id ON application_status_history(application_id);

CREATE TABLE sent_mail (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    application_id  UUID REFERENCES applications(id),
    to_email        CITEXT NOT NULL,
    subject         VARCHAR(500) NOT NULL,
    body            TEXT NOT NULL,
    provider_msg_id VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'SENT',
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sent_mail_company_id ON sent_mail(company_id);

-- ==============================================================
-- SOCIAL (Connections, Posts, Hub)
-- ==============================================================

CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','DECLINED','WITHDRAWN')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    UNIQUE(requester_id, addressee_id),
    CHECK (requester_id != addressee_id)
);

CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);

CREATE TABLE intro_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note            TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','DECLINED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at    TIMESTAMPTZ,
    UNIQUE(from_user_id, investor_user_id)
);

CREATE INDEX idx_intro_requests_from_user_id ON intro_requests(from_user_id);
CREATE INDEX idx_intro_requests_investor_user_id ON intro_requests(investor_user_id);

CREATE TABLE hub_memberships (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id)
);

CREATE INDEX idx_hub_memberships_company_id ON hub_memberships(company_id);

CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind            VARCHAR(20) NOT NULL DEFAULT 'UPDATE' CHECK (kind IN ('UPDATE','COMPETITION')),
    body            TEXT,
    image_media_id  UUID REFERENCES media_assets(id),
    title           VARCHAR(300),
    deadline        DATE,
    link            VARCHAR(500),
    visible_from    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visible_until   TIMESTAMPTZ NOT NULL,
    is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_visible ON posts(visible_from, visible_until);
CREATE INDEX idx_posts_kind ON posts(kind);

CREATE TABLE post_likes (
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- ==============================================================
-- IDEAS & MEETUPS
-- ==============================================================

CREATE TABLE ideas (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(300) NOT NULL,
    description TEXT,
    type        VARCHAR(50),
    team        VARCHAR(300),
    ask         TEXT,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ideas_author_id ON ideas(author_id);

CREATE TABLE idea_skills (
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    skill   VARCHAR(100) NOT NULL,
    PRIMARY KEY (idea_id, skill)
);

CREATE TABLE idea_requests (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_id     UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','DECLINED')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(idea_id, user_id)
);

CREATE INDEX idx_idea_requests_idea_id ON idea_requests(idea_id);
CREATE INDEX idx_idea_requests_user_id ON idea_requests(user_id);

CREATE TABLE meetups (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(300) NOT NULL,
    description TEXT,
    starts_at   TIMESTAMPTZ NOT NULL,
    kind        VARCHAR(30) CHECK (kind IN ('VIDEO_CALL','IN_PERSON','WEBINAR')),
    platform    VARCHAR(50),
    link        VARCHAR(500),
    venue       TEXT,
    capacity    INT,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetups_host_id ON meetups(host_id);
CREATE INDEX idx_meetups_starts_at ON meetups(starts_at);

CREATE TABLE meetup_attendees (
    meetup_id   UUID NOT NULL REFERENCES meetups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (meetup_id, user_id)
);

-- ==============================================================
-- MESSAGING
-- ==============================================================

CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_a_id, user_b_id),
    CHECK (user_a_id < user_b_id)
);

CREATE INDEX idx_conversations_user_a ON conversations(user_a_id);
CREATE INDEX idx_conversations_user_b ON conversations(user_b_id);

CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body                TEXT,
    attachment_media_id UUID REFERENCES media_assets(id),
    delivered_at        TIMESTAMPTZ,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

-- ==============================================================
-- WORKSPACE (DOCUMENTS)
-- ==============================================================

CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    body        TEXT,
    version     BIGINT NOT NULL DEFAULT 1,
    template_key VARCHAR(100),
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_owner_id ON documents(owner_id);

CREATE TABLE document_shares (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission  VARCHAR(20) NOT NULL CHECK (permission IN ('VIEW','EDIT')),
    shared_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (document_id, user_id)
);

CREATE INDEX idx_document_shares_user_id ON document_shares(user_id);

CREATE TABLE document_versions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version     BIGINT NOT NULL,
    body        TEXT,
    saved_by    UUID REFERENCES users(id),
    saved_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_versions_doc_id ON document_versions(document_id, version DESC);

-- ==============================================================
-- CHECKLISTS & TODOS
-- ==============================================================

CREATE TABLE todos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    done        BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);

CREATE TABLE checklist_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope       VARCHAR(30) NOT NULL CHECK (scope IN ('LAUNCH','DAILY')),
    item_key    VARCHAR(100) NOT NULL,
    title       VARCHAR(500) NOT NULL,
    done_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, scope, item_key)
);

CREATE INDEX idx_checklist_items_user_id ON checklist_items(user_id);

CREATE TABLE daily_checklist_log (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    item_index  SMALLINT NOT NULL,
    done_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, date, item_index)
);

-- ==============================================================
-- NOTIFICATIONS
-- ==============================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    payload     JSONB,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(user_id, read_at) WHERE read_at IS NULL;

CREATE TABLE notification_prefs (
    user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_digest BOOLEAN NOT NULL DEFAULT TRUE,
    prefs       JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE push_subscriptions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint    TEXT NOT NULL UNIQUE,
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- ==============================================================
-- BILLING & PLANS
-- ==============================================================

CREATE TABLE plans (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(50) UNIQUE NOT NULL,
    price_paise INT NOT NULL DEFAULT 0,
    interval    VARCHAR(20) NOT NULL DEFAULT 'MONTH',
    features    JSONB NOT NULL DEFAULT '{}',
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id             UUID NOT NULL REFERENCES plans(id),
    gateway_sub_id      VARCHAR(255) UNIQUE,
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED','AUTHENTICATED','ACTIVE','HALTED','CANCELLED','COMPLETED','EXPIRED')),
    current_period_start TIMESTAMPTZ,
    current_period_end  TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    grace_period_end    TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES subscriptions(id),
    gateway_payment_id VARCHAR(255) UNIQUE,
    amount_paise    INT NOT NULL,
    status          VARCHAR(30) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);

CREATE TABLE webhook_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        VARCHAR(255) UNIQUE NOT NULL,
    source          VARCHAR(30) NOT NULL,
    event_type      VARCHAR(100) NOT NULL,
    payload         JSONB NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================
-- VERIFICATION
-- ==============================================================

CREATE TABLE verification_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','APPROVED','REJECTED')),
    snapshot        JSONB,
    reviewed_by     UUID REFERENCES users(id),
    reason          TEXT,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);

CREATE TABLE verified_flags (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    verified_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_request_id UUID REFERENCES verification_requests(id),
    revoked_at      TIMESTAMPTZ
);

-- ==============================================================
-- USAGE COUNTERS (connection/intro limits)
-- ==============================================================

CREATE TABLE usage_counters (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind        VARCHAR(30) NOT NULL CHECK (kind IN ('CONNECTIONS_DAY','INTROS_MONTH')),
    period_key  VARCHAR(20) NOT NULL,
    count       INT NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, kind, period_key)
);

-- ==============================================================
-- ADS
-- ==============================================================

CREATE TABLE ads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advertiser_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand           VARCHAR(100) NOT NULL,
    headline        VARCHAR(60) NOT NULL,
    description     VARCHAR(120),
    cta             VARCHAR(20) NOT NULL DEFAULT 'Learn more',
    url             VARCHAR(500) NOT NULL,
    image_media_id  UUID REFERENCES media_assets(id),
    duration_days   INT NOT NULL,
    price_paise     INT NOT NULL,
    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','ACTIVE','REJECTED','EXPIRED','PAUSED')),
    is_house_ad     BOOLEAN NOT NULL DEFAULT FALSE,
    is_demo         BOOLEAN NOT NULL DEFAULT FALSE,
    order_id        VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ads_advertiser_id ON ads(advertiser_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_active ON ads(status, starts_at, ends_at) WHERE status = 'ACTIVE';

CREATE TABLE ad_events (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id   UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    type    VARCHAR(20) NOT NULL CHECK (type IN ('IMPRESSION','CLICK')),
    at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ad_events_ad_id ON ad_events(ad_id);

-- ==============================================================
-- THEMES
-- ==============================================================

CREATE TABLE themes (
    id          VARCHAR(50) PRIMARY KEY,
    kind        VARCHAR(20) NOT NULL CHECK (kind IN ('COMPANY','PROFILE','APP')),
    name        VARCHAR(100) NOT NULL,
    is_free     BOOLEAN NOT NULL DEFAULT FALSE,
    config      JSONB NOT NULL,
    version     INT NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_palettes (
    id          VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    is_free     BOOLEAN NOT NULL DEFAULT FALSE,
    config      JSONB NOT NULL
);

-- ==============================================================
-- MODERATION & ADMIN
-- ==============================================================

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id     UUID NOT NULL REFERENCES users(id),
    target_type     VARCHAR(30) NOT NULL CHECK (target_type IN ('USER','POST','AD','COMPANY','IDEA')),
    target_id       UUID NOT NULL,
    reason          VARCHAR(100) NOT NULL,
    details         TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','REVIEWED','DISMISSED')),
    reviewed_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);

CREATE TABLE blocks (
    blocker_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id   UUID,
    details     JSONB,
    ip_address  INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

CREATE TABLE feature_flags (
    key         VARCHAR(100) PRIMARY KEY,
    enabled     BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search indices
CREATE INDEX idx_users_fts ON users USING GIN (to_tsvector('english', coalesce(user_handle,'')));
CREATE INDEX idx_companies_fts ON companies USING GIN (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(tagline,'') || ' ' || coalesce(about,'')));
CREATE INDEX idx_posts_fts ON posts USING GIN (to_tsvector('english', coalesce(body,'') || ' ' || coalesce(title,'')));
CREATE INDEX idx_ideas_fts ON ideas USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));
