-- V7__seed_default_pipeline.sql
-- Requisito: 14.4 — pipeline por defecto con etapas predefinidas para cada workspace existente.
-- Al crear un nuevo workspace, la aplicación debe llamar a seed_default_pipeline(workspace_id).

-- ============================================================
-- Función reutilizable: seed_default_pipeline(workspace_id)
-- Crea el pipeline por defecto con sus 6 etapas para un workspace dado.
-- Idempotente: no inserta si ya existe un pipeline is_default=true en ese workspace.
-- ============================================================
CREATE OR REPLACE FUNCTION seed_default_pipeline(p_workspace_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_pipeline_id UUID;
BEGIN
    -- Verificar si ya existe un pipeline por defecto para este workspace
    IF EXISTS (
        SELECT 1 FROM pipelines
        WHERE workspace_id = p_workspace_id AND is_default = TRUE
    ) THEN
        RETURN;
    END IF;

    -- Insertar pipeline por defecto
    INSERT INTO pipelines (id, workspace_id, name, is_default)
    VALUES (gen_random_uuid(), p_workspace_id, 'Pipeline de Ventas', TRUE)
    RETURNING id INTO v_pipeline_id;

    -- Insertar etapas en orden
    INSERT INTO pipeline_stages (id, workspace_id, pipeline_id, name, color, position, is_won, is_lost)
    VALUES
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Nuevo Lead',       '#6366F1', 1, FALSE, FALSE),
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Contactado',       '#3B82F6', 2, FALSE, FALSE),
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Propuesta',        '#F59E0B', 3, FALSE, FALSE),
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Negociación',      '#EF4444', 4, FALSE, FALSE),
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Cerrado Ganado',   '#10B981', 5, TRUE,  FALSE),
        (gen_random_uuid(), p_workspace_id, v_pipeline_id, 'Cerrado Perdido',  '#6B7280', 6, FALSE, TRUE);
END;
$$;

-- ============================================================
-- Seed para workspaces existentes
-- ============================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM workspaces LOOP
        PERFORM seed_default_pipeline(r.id);
    END LOOP;
END;
$$;
