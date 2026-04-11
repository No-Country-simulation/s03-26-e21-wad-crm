-- V14__add_conversation_lock_fields.sql
-- Add lock fields for multi-agent conversation support

ALTER TABLE conversations ADD COLUMN locked_by UUID;
ALTER TABLE conversations ADD COLUMN locked_at TIMESTAMP;

CREATE INDEX idx_conversations_locked_by ON conversations(locked_by);
