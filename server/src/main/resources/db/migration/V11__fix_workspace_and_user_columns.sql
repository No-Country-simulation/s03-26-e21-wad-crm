-- V11__fix_workspace_and_user_columns.sql
-- Adds missing columns that entities expect but migrations didn't create

-- Add slug to workspaces (entity has it but V1 migration might not have run with it)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug VARCHAR(100);
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug) WHERE slug IS NOT NULL;

-- Add created_by to users table (required by AuditableEntity)
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add created_by to workspaces table (required by AuditableEntity)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
