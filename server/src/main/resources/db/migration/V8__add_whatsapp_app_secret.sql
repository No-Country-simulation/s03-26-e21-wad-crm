-- V8__add_whatsapp_app_secret.sql
-- Req 20.1, 20.5: app_secret necesario para verificar firma HMAC-SHA256 del webhook de Meta
ALTER TABLE whatsapp_configs
    ADD COLUMN IF NOT EXISTS app_secret TEXT;
