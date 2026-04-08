-- V12__create_email_templates.sql
-- Requisitos: 25.5 (plantillas de email), 27.4 (plantillas predefinidas)

-- ============================================================
-- Table: email_templates
-- ============================================================
CREATE TABLE IF NOT EXISTS email_templates (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    subject      VARCHAR(500) NOT NULL,
    body         TEXT         NOT NULL,
    description  TEXT,
    category     VARCHAR(50)  NOT NULL DEFAULT 'CUSTOM'
                     CHECK (category IN ('WELCOME', 'FOLLOW_UP', 'PROPOSAL', 'CLOSING', 'MEETING', 'CUSTOM')),
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uq_email_templates_workspace_name UNIQUE (workspace_id, name)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_email_templates_workspace_id    ON email_templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category        ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active_default ON email_templates(workspace_id, is_active, is_default);

-- ============================================================
-- Seed: Plantillas por defecto para workspaces existentes
-- ============================================================
DO $$
DECLARE
    r RECORD;
    v_welcome_id UUID;
    v_followup_id UUID;
    v_proposal_id UUID;
BEGIN
    FOR r IN SELECT id FROM workspaces LOOP
        -- Plantilla de Bienvenida
        INSERT INTO email_templates (id, workspace_id, name, subject, body, description, category, is_active, is_default)
        VALUES (gen_random_uuid(), r.id,
            'Welcome Email',
            'Bienvenido/a {{contact_name}} - Gracias por contactarnos',
            '<html><body><h1>¡Bienvenido/a {{contact_name}}!</h1><p>Gracias por tu interés en nuestros servicios.</p><p>Nos pondremos en contacto contigo pronto.</p><p>Saludos cordiales,<br>{{company_name}}</p></body></html>',
            'Email de bienvenida automático para nuevos contactos',
            'WELCOME', TRUE, TRUE)
        ON CONFLICT (workspace_id, name) DO NOTHING;

        -- Plantilla de Seguimiento
        INSERT INTO email_templates (id, workspace_id, name, subject, body, description, category, is_active)
        VALUES (gen_random_uuid(), r.id,
            'Follow-up Email',
            'Seguimiento - {{contact_name}}',
            '<html><body><h1>Hola {{contact_name}},</h1><p>Espero que te encuentres bien.</p><p>Quería hacer seguimiento de nuestra conversación anterior.</p><p>¿Hay algo en lo que pueda ayudarte?</p><p>Saludos,<br>{{company_name}}</p></body></html>',
            'Email de seguimiento para contactos sin respuesta',
            'FOLLOW_UP', TRUE)
        ON CONFLICT (workspace_id, name) DO NOTHING;

        -- Plantilla de Propuesta
        INSERT INTO email_templates (id, workspace_id, name, subject, body, description, category, is_active)
        VALUES (gen_random_uuid(), r.id,
            'Proposal Email',
            'Propuesta comercial - {{contact_name}}',
            '<html><body><h1>Propuesta para {{contact_name}}</h1><p>Adjunto encontrará nuestra propuesta comercial.</p><p>Quedo a su disposición para cualquier consulta.</p><p>Saludos cordiales,<br>{{company_name}}</p></body></html>',
            'Email para enviar propuestas comerciales',
            'PROPOSAL', TRUE)
        ON CONFLICT (workspace_id, name) DO NOTHING;
    END LOOP;
END;
$$;
