-- V21: Campaign Buttons / Botones de Landing Configurables

CREATE TABLE campaign_buttons (
    id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id        UUID              NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    
    name                VARCHAR(100)      NOT NULL,
    button_type         VARCHAR(20)       NOT NULL CHECK (button_type IN ('WHATSAPP', 'URL', 'FORM', 'DEMO', 'CUSTOM')),
    label               VARCHAR(255)      NOT NULL,
    url                 VARCHAR(500),
    whatsapp_number     VARCHAR(50),
    whatsapp_message    TEXT,
    
    color               VARCHAR(20)       DEFAULT '#25D366',
    position            VARCHAR(20)       NOT NULL CHECK (position IN ('HEADER', 'HERO', 'FOOTER', 'FLOATING', 'BANNER')),
    
    show_on_desktop     BOOLEAN           DEFAULT TRUE,
    show_on_mobile      BOOLEAN           DEFAULT TRUE,
    is_active           BOOLEAN           DEFAULT TRUE,
    
    start_date          DATE,
    end_date            DATE,
    
    created_at          TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaign_buttons_workspace ON campaign_buttons(workspace_id);
CREATE INDEX idx_campaign_buttons_active ON campaign_buttons(is_active);