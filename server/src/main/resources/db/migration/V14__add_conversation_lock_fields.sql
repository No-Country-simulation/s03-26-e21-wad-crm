<<<<<<< HEAD
-- V14__add_conversation_lock_fields.sql
-- Add lock fields for multi-agent conversation support

ALTER TABLE conversations ADD COLUMN locked_by UUID;
ALTER TABLE conversations ADD COLUMN locked_at TIMESTAMP;

CREATE INDEX idx_conversations_locked_by ON conversations(locked_by);
=======
-- Add multi-agente conversation lock fields
-- Allows tracking which user is handling a conversation to prevent message conflicts

ALTER TABLE conversations
ADD COLUMN locked_by_user_id UUID,
ADD COLUMN locked_at TIMESTAMP,
ADD COLUMN locked_until TIMESTAMP;

-- Index for checking active locks
CREATE INDEX idx_conversations_locked_by_user_id 
ON conversations(locked_by_user_id) 
WHERE locked_by_user_id IS NOT NULL;

-- Index for checking expired locks
CREATE INDEX idx_conversations_locked_until 
ON conversations(locked_until) 
WHERE locked_until IS NOT NULL;

-- Foreign key to users table
ALTER TABLE conversations
ADD CONSTRAINT fk_conversations_locked_by_user_id
FOREIGN KEY (locked_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
>>>>>>> origin/feat/startup-crm/whatsapp
