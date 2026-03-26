-- V2__create_contacts_companies_tags.sql
-- Requisitos: 9.2 (email único por workspace), 11.1 (soft delete en listados activos)

-- ============================================================
-- Table: companies
-- ============================================================
CREATE TABLE companies (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    domain       VARCHAR(255),
    industry     VARCHAR(100),
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: contacts
-- ============================================================
CREATE TABLE contacts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    company_id   UUID         REFERENCES companies(id) ON DELETE SET NULL,
    assigned_to  UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255),
    phone        VARCHAR(50),
    job_title    VARCHAR(255),
    status       VARCHAR(20)  NOT NULL DEFAULT 'NEW'
                     CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED')),
    is_deleted   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_contacts_workspace_email UNIQUE (workspace_id, email)
);

-- ============================================================
-- Table: tags
-- ============================================================
CREATE TABLE tags (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    color        VARCHAR(20),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_tags_workspace_name UNIQUE (workspace_id, name)
);

-- ============================================================
-- Table: contact_tags
-- ============================================================
CREATE TABLE contact_tags (
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

-- ============================================================
-- Table: contact_notes
-- ============================================================
CREATE TABLE contact_notes (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id   UUID         NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    body         TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
-- Req 9.2: unicidad email por workspace (ya cubierta por UNIQUE constraint, índice explícito para queries)
CREATE UNIQUE INDEX idx_contacts_workspace_email ON contacts(workspace_id, email)
    WHERE email IS NOT NULL;

-- Req 11.1: filtrado por status en listados activos
CREATE INDEX idx_contacts_workspace_status ON contacts(workspace_id, status)
    WHERE is_deleted = FALSE;

-- Req 11.1: filtrado por assigned_to
CREATE INDEX idx_contacts_assigned_to ON contacts(assigned_to);

-- Soporte para búsqueda y joins frecuentes
CREATE INDEX idx_contacts_workspace_id  ON contacts(workspace_id);
CREATE INDEX idx_companies_workspace_id ON companies(workspace_id);
CREATE INDEX idx_tags_workspace_id      ON tags(workspace_id);
CREATE INDEX idx_contact_notes_contact  ON contact_notes(contact_id);
