-- V23: Booking Settings - Configuración de citas/reservas

CREATE TABLE booking_settings (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
    
    is_enabled          BOOLEAN           DEFAULT FALSE,
    default_duration    INTEGER           DEFAULT 30,
    buffer_minutes      INTEGER           DEFAULT 15,
    
    work_days           VARCHAR(20)       DEFAULT 'MON-FRI',
    work_start_time     VARCHAR(10)       DEFAULT '09:00',
    work_end_time       VARCHAR(10)       DEFAULT '18:00',
    timezone            VARCHAR(50)       DEFAULT 'America/Argentina/Buenos_Aires',
    
    booking_page_enabled BOOLEAN          DEFAULT FALSE,
    booking_page_slug    VARCHAR(100),
    primary_color       VARCHAR(20)       DEFAULT '#2563EB',
    
    send_confirmation   BOOLEAN           DEFAULT TRUE,
    send_reminder       BOOLEAN           DEFAULT TRUE,
    reminder_hours      INTEGER           DEFAULT 24,
    
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_settings_workspace ON booking_settings(workspace_id);