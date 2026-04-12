-- V24: Appointment Types - Tipos de cita configurables

CREATE TABLE appointment_types (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    name                VARCHAR(100)      NOT NULL,
    description         TEXT,
    duration_minutes    INTEGER           NOT NULL DEFAULT 30,
    is_active           BOOLEAN           DEFAULT TRUE,
    
    price               DECIMAL(10,2),
    currency            VARCHAR(3)        DEFAULT 'USD',
    
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointment_types_workspace ON appointment_types(workspace_id);
CREATE INDEX idx_appointment_types_active ON appointment_types(is_active);