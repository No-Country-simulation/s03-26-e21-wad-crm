-- V12__add_whatsapp_workspace_id.sql
-- Fix: garantiza workspace_id en whatsapp_configs para resolver workspace en webhook

ALTER TABLE whatsapp_configs
    ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- Backfill defensivo para entornos legacy
DO $$
DECLARE
    ws_count INT;
    null_count INT;
    default_workspace UUID;
BEGIN
    SELECT COUNT(*) INTO ws_count FROM workspaces;
    SELECT COUNT(*) INTO null_count FROM whatsapp_configs WHERE workspace_id IS NULL;

    IF null_count > 0 THEN
        IF ws_count = 1 THEN
            SELECT id INTO default_workspace FROM workspaces LIMIT 1;
            UPDATE whatsapp_configs
            SET workspace_id = default_workspace
            WHERE workspace_id IS NULL;
        ELSE
            RAISE EXCEPTION 'Cannot auto-backfill whatsapp_configs.workspace_id: found % rows without workspace_id and % workspaces. Manual backfill required before NOT NULL constraint.', null_count, ws_count;
        END IF;
    END IF;
END $$;

ALTER TABLE whatsapp_configs
    ALTER COLUMN workspace_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_whatsapp_configs_workspace'
          AND table_name = 'whatsapp_configs'
    ) THEN
        ALTER TABLE whatsapp_configs
            ADD CONSTRAINT fk_whatsapp_configs_workspace
            FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_whatsapp_configs_workspace_id
    ON whatsapp_configs(workspace_id);
