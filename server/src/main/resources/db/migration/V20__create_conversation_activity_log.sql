-- V20: Agent Activity Log / Bitácora de Conversación
-- Requiere: Seguimiento de actividad por agente para auditoría y KPIs

CREATE TYPE agent_action AS ENUM ('STARTED', 'REPLIED', 'ESCALATED', 'TRANSFERRED', 'CLOSED', 'ADDED_NOTE');

CREATE TABLE conversation_activity_log (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    conversation_id     UUID              NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    agent_id            UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    action              agent_action      NOT NULL,
    message_preview    TEXT,
    internal_note      TEXT,
    timestamp          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_conversation ON conversation_activity_log(conversation_id);
CREATE INDEX idx_activity_log_agent ON conversation_activity_log(agent_id);
CREATE INDEX idx_activity_log_workspace ON conversation_activity_log(workspace_id);
CREATE INDEX idx_activity_log_timestamp ON conversation_activity_log(timestamp);