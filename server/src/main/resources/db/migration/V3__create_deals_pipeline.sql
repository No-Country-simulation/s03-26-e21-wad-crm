-- V3__create_deals_pipeline.sql
-- Requisitos: 14.4 (etapa asignada al crear deal), 17.4 (soft delete excluye deals de listados)

-- ============================================================
-- Table: pipelines
-- ============================================================
CREATE TABLE pipelines (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: pipeline_stages
-- ============================================================
CREATE TABLE pipeline_stages (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    pipeline_id  UUID         NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    color        VARCHAR(20),
    position     INT          NOT NULL DEFAULT 0,
    is_won       BOOLEAN      NOT NULL DEFAULT FALSE,
    is_lost      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: deals
-- ============================================================
CREATE TABLE deals (
    id                   UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id         UUID           NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name                 VARCHAR(255)   NOT NULL,
    value                NUMERIC(15, 2),
    stage_id             UUID           REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    contact_id           UUID           REFERENCES contacts(id) ON DELETE SET NULL,
    company_id           UUID           REFERENCES companies(id) ON DELETE SET NULL,
    assigned_to          UUID           REFERENCES users(id) ON DELETE SET NULL,
    created_by           UUID           REFERENCES users(id) ON DELETE SET NULL,
    expected_close_date  DATE,
    is_deleted           BOOLEAN        NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: deal_stage_history
-- ============================================================
CREATE TABLE deal_stage_history (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id        UUID        NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    from_stage_id  UUID        REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    to_stage_id    UUID        REFERENCES pipeline_stages(id) ON DELETE SET NULL,
    changed_by     UUID        REFERENCES users(id) ON DELETE SET NULL,
    changed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
-- Req 14.4: lookup de deals por workspace + etapa (kanban view)
CREATE INDEX idx_deals_workspace_stage_id  ON deals(workspace_id, stage_id);

-- Req 17.4: filtrar soft-deleted en listados activos
CREATE INDEX idx_deals_workspace_is_deleted ON deals(workspace_id, is_deleted);

-- Req 14.4: ordenar etapas dentro de un pipeline
CREATE INDEX idx_pipeline_stages_pipeline_order ON pipeline_stages(pipeline_id, position);

-- Soporte para joins y filtros frecuentes
CREATE INDEX idx_deals_workspace_id         ON deals(workspace_id);
CREATE INDEX idx_deals_contact_id           ON deals(contact_id);
CREATE INDEX idx_deals_assigned_to          ON deals(assigned_to);
CREATE INDEX idx_pipeline_stages_workspace  ON pipeline_stages(workspace_id);
CREATE INDEX idx_deal_stage_history_deal_id ON deal_stage_history(deal_id);
