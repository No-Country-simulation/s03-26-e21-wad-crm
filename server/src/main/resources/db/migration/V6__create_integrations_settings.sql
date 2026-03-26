-- V6__create_integrations_settings.sql
-- Requisitos: 19.1 (WhatsApp config), 23.1 (SMTP config), 24.1 (Gmail config), NFR-6 (AES-256 encryption)
-- Todos los campos de credenciales se almacenan como TEXT (encriptados con AES-256 por EncryptionService)

-- ============================================================
-- Table: whatsapp_configs
-- ============================================================
CREATE TABLE whatsapp_configs (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id         UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    phone_number_id      VARCHAR(255) NOT NULL,
    access_token         TEXT         NOT NULL,  -- AES-256 encrypted
    webhook_verify_token TEXT         NOT NULL,  -- AES-256 encrypted
    connected_at         TIMESTAMPTZ,
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Only one active WhatsApp config per workspace
CREATE UNIQUE INDEX idx_whatsapp_configs_workspace_active
    ON whatsapp_configs(workspace_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_whatsapp_configs_workspace_id ON whatsapp_configs(workspace_id);

-- ============================================================
-- Table: email_smtp_configs
-- ============================================================
CREATE TABLE email_smtp_configs (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    host         VARCHAR(255) NOT NULL,
    port         INTEGER      NOT NULL,
    username     VARCHAR(255) NOT NULL,
    password     TEXT         NOT NULL,  -- AES-256 encrypted
    encryption   VARCHAR(10)  NOT NULL DEFAULT 'TLS',  -- NONE, SSL, TLS
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_smtp_encryption CHECK (encryption IN ('NONE', 'SSL', 'TLS'))
);

-- Only one active SMTP config per workspace
CREATE UNIQUE INDEX idx_email_smtp_configs_workspace_active
    ON email_smtp_configs(workspace_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_email_smtp_configs_workspace_id ON email_smtp_configs(workspace_id);

-- ============================================================
-- Table: gmail_configs
-- ============================================================
CREATE TABLE gmail_configs (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id     UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email            VARCHAR(255) NOT NULL,
    access_token     TEXT         NOT NULL,  -- AES-256 encrypted
    refresh_token    TEXT         NOT NULL,  -- AES-256 encrypted
    token_expires_at TIMESTAMPTZ,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Only one active Gmail config per workspace
CREATE UNIQUE INDEX idx_gmail_configs_workspace_active
    ON gmail_configs(workspace_id)
    WHERE is_active = TRUE;

CREATE INDEX idx_gmail_configs_workspace_id ON gmail_configs(workspace_id);
