-- V4__create_conversations_messages.sql
-- Requisitos: 20.4 (externalId único, canal WHATSAPP), 22.1 (mensajes ordenados por sentAt)

-- ============================================================
-- Table: conversations
-- ============================================================
CREATE TABLE conversations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id      UUID        NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    channel         VARCHAR(20) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_conversations_channel CHECK (channel IN ('WHATSAPP', 'EMAIL')),
    CONSTRAINT chk_conversations_status  CHECK (status  IN ('OPEN', 'CLOSED', 'ARCHIVED'))
);

-- ============================================================
-- Table: messages
-- ============================================================
CREATE TABLE messages (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    workspace_id    UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    channel         VARCHAR(20) NOT NULL,
    direction       VARCHAR(10) NOT NULL,
    body            TEXT,
    external_id     VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'SENT',
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,

    CONSTRAINT chk_messages_channel   CHECK (channel   IN ('WHATSAPP', 'EMAIL')),
    CONSTRAINT chk_messages_direction CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    CONSTRAINT chk_messages_status    CHECK (status    IN ('SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED'))
);

-- ============================================================
-- Indexes
-- ============================================================
-- Req 20.4: lookup de conversación activa por workspace + contacto + canal (findOrCreate)
CREATE INDEX idx_conversations_workspace_contact_channel
    ON conversations(workspace_id, contact_id, channel);

-- Req 22.1: paginación de mensajes ordenados por sentAt asc
CREATE INDEX idx_messages_conversation_sent_at
    ON messages(conversation_id, sent_at);

-- Req 20.4: idempotencia de webhook — garantizar un solo mensaje por externalId
CREATE UNIQUE INDEX idx_messages_external_id
    ON messages(external_id)
    WHERE external_id IS NOT NULL;

-- Soporte para filtros y joins frecuentes
CREATE INDEX idx_conversations_workspace_id       ON conversations(workspace_id);
CREATE INDEX idx_conversations_last_message_at    ON conversations(workspace_id, last_message_at DESC);
CREATE INDEX idx_messages_workspace_id            ON messages(workspace_id);
