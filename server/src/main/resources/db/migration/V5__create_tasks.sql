-- V5__create_tasks.sql
-- Requisitos: 27.1 (crear tarea con campos requeridos), 28.2 (filtros por fecha dueAt)

-- ============================================================
-- Table: tasks
-- ============================================================
CREATE TABLE tasks (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    priority     VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    due_at       TIMESTAMPTZ,
    is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID         REFERENCES users(id) ON DELETE SET NULL,
    contact_id   UUID         REFERENCES contacts(id) ON DELETE SET NULL,
    deal_id      UUID         REFERENCES deals(id) ON DELETE SET NULL,
    assigned_to  UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
-- Req 28.2: filtrar tareas por workspace + usuario asignado
CREATE INDEX idx_tasks_workspace_assigned_to ON tasks(workspace_id, assigned_to);

-- Req 28.2: filtrar tareas por workspace + fecha de vencimiento (dueBefore/dueAfter)
CREATE INDEX idx_tasks_workspace_due_at ON tasks(workspace_id, due_at);

-- Req 28.2: filtrar tareas por workspace + estado completado
CREATE INDEX idx_tasks_workspace_is_completed ON tasks(workspace_id, is_completed);

-- Soporte para joins y filtros frecuentes
CREATE INDEX idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX idx_tasks_contact_id   ON tasks(contact_id);
CREATE INDEX idx_tasks_deal_id      ON tasks(deal_id);
