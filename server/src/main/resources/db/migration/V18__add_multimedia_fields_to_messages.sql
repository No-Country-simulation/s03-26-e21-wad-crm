-- V18: Add multimedia support to messages table
-- Adds fields for WhatsApp multimedia messages (image, audio, video, document, sticker)

ALTER TABLE messages
    ADD COLUMN type VARCHAR(20) DEFAULT 'text',
    ADD COLUMN media_url TEXT,
    ADD COLUMN mime_type VARCHAR(100),
    ADD COLUMN caption TEXT;

-- Add index for type for faster filtering
CREATE INDEX idx_messages_type ON messages(type);

COMMENT ON COLUMN messages.type IS 'Message type: text, image, audio, video, document, sticker';
COMMENT ON COLUMN messages.media_url IS 'URL of the media file from WhatsApp API';
COMMENT ON COLUMN messages.mime_type IS 'MIME type of the media file (e.g., image/jpeg, audio/ogg)';
COMMENT ON COLUMN messages.caption IS 'Caption or description for multimedia messages';
