-- V1__create_workspace_and_users.sql
-- Requisitos: 1.1 (registro crea usuario ADMIN + Workspace), 2.4 (hash de refresh token en DB)

-- ============================================================
-- Table: workspaces
-- ============================================================
CREATE TABLE workspaces (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    plan        VARCHAR(50)  NOT NULL DEFAULT 'FREE',
    timezone    VARCHAR(100) NOT NULL DEFAULT 'UTC',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_workspaces_slug UNIQUE (slug)
);

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE users (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255),
    name            VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    timezone        VARCHAR(100) NOT NULL DEFAULT 'UTC',
    role            VARCHAR(20)  NOT NULL DEFAULT 'SALES'
                        CHECK (role IN ('ADMIN', 'MANAGER', 'SALES')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    google_id       VARCHAR(255),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ============================================================
-- Table: refresh_tokens
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash  VARCHAR(255) NOT NULL,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    revoked_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_users_email        ON users(email);
CREATE INDEX idx_users_workspace_id ON users(workspace_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
