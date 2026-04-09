-- Fix messages unique constraint to support multi-agent architecture
-- Problem: idx_messages_external_id was GLOBAL, preventing same external_id in different workspaces
-- Solution: Make constraint COMPOSITE (external_id, workspace_id) so each workspace can have its own copy
-- Also: TRUNCATE messages to start fresh after the fix

-- Drop the old GLOBAL unique constraint
DROP INDEX IF EXISTS idx_messages_external_id;

-- Create new COMPOSITE unique constraint (external_id + workspace_id)
-- This allows the SAME external_id to exist once per workspace
CREATE UNIQUE INDEX idx_messages_external_id ON messages(external_id, workspace_id) 
WHERE external_id IS NOT NULL;

-- Clean up: TRUNCATE messages table to start fresh
-- (no messages are critical yet, this is during development)
TRUNCATE TABLE messages CASCADE;

-- Note: CASCADE automatically truncates dependent tables if they exist
-- In this case, it handles any future dependencies
