-- V19: Citas y Reservas / Appointments
-- Requisito: Sistema de citas para agendamiento

CREATE TYPE appointment_type AS ENUM ('VIRTUAL', 'PRESENTIAL', 'PHONE');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

CREATE TABLE appointments (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    contact_id          UUID              REFERENCES contacts(id) ON DELETE SET NULL,
    assigned_to_user_id UUID              REFERENCES users(id) ON DELETE SET NULL,
    
    -- Cita details
    title               VARCHAR(255)      NOT NULL,
    description         TEXT,
    appointment_type    appointment_type  NOT NULL,
    status              appointment_status NOT NULL DEFAULT 'PENDING',
    
    -- Scheduling
    scheduled_start     TIMESTAMPTZ       NOT NULL,
    scheduled_end       TIMESTAMPTZ       NOT NULL,
    duration_minutes    INTEGER           NOT NULL DEFAULT 30,
    
    -- Virtual meeting
    meeting_url         VARCHAR(500),
    meeting_id          VARCHAR(100),
    
    -- Tracking
    created_by          UUID              REFERENCES users(id),
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    cancelled_at        TIMESTAMPTZ,
    cancel_reason       TEXT
);

CREATE INDEX idx_appointments_workspace ON appointments(workspace_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_start);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_contact ON appointments(contact_id);
CREATE INDEX idx_appointments_assigned ON appointments(assigned_to_user_id);

COMMENT ON TABLE appointments IS 'Citas y reservas para meetings con clientes';
COMMENT ON COLUMN appointments.appointment_type IS 'Tipo de cita: VIRTUAL, PRESENTIAL, PHONE';
COMMENT ON COLUMN appointments.status IS 'Estado: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW';