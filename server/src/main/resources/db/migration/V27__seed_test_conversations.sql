-- V27__seed_test_conversations.sql
-- Seed test conversations for development (idempotent version)

-- Create test contacts if not exists (using DO NOTHING for idempotency)
DO $$
DECLARE
    ws_id UUID;
BEGIN
    -- Get workspace ID
    SELECT id INTO ws_id FROM workspaces WHERE slug = 'nexo-default' LIMIT 1;
    
    IF ws_id IS NOT NULL THEN
        -- Insert contacts only if they don't exist
        INSERT INTO contacts (workspace_id, name, email, phone, status, created_at, updated_at)
        SELECT ws_id, 'Juan Pérez', 'juan@perez.com', '+5491155550001', 'NEW', NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE workspace_id = ws_id AND email = 'juan@perez.com');

        INSERT INTO contacts (workspace_id, name, email, phone, status, created_at, updated_at)
        SELECT ws_id, 'María García', 'maria@garcia.com', '+5491155550002', 'NEW', NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE workspace_id = ws_id AND email = 'maria@garcia.com');

        INSERT INTO contacts (workspace_id, name, email, phone, status, created_at, updated_at)
        SELECT ws_id, 'Carlos López', 'carlos@lopez.com', '+5491155550003', 'NEW', NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE workspace_id = ws_id AND email = 'carlos@lopez.com');

        -- Create conversations
        INSERT INTO conversations (workspace_id, contact_id, channel, status, last_message_at, created_at, updated_at)
        SELECT ws_id, c.id, 'WHATSAPP', 'OPEN', NOW(), NOW(), NOW()
        FROM contacts c
        WHERE c.workspace_id = ws_id AND c.email = 'juan@perez.com'
        AND NOT EXISTS (SELECT 1 FROM conversations WHERE workspace_id = ws_id AND contact_id = c.id AND channel = 'WHATSAPP');

        INSERT INTO conversations (workspace_id, contact_id, channel, status, last_message_at, created_at, updated_at)
        SELECT ws_id, c.id, 'WHATSAPP', 'OPEN', NOW() - INTERVAL '30 minutes', NOW(), NOW()
        FROM contacts c
        WHERE c.workspace_id = ws_id AND c.email = 'maria@garcia.com'
        AND NOT EXISTS (SELECT 1 FROM conversations WHERE workspace_id = ws_id AND contact_id = c.id AND channel = 'WHATSAPP');

        INSERT INTO conversations (workspace_id, contact_id, channel, status, last_message_at, created_at, updated_at)
        SELECT ws_id, c.id, 'WHATSAPP', 'OPEN', NOW() - INTERVAL '2 hours', NOW(), NOW()
        FROM contacts c
        WHERE c.workspace_id = ws_id AND c.email = 'carlos@lopez.com'
        AND NOT EXISTS (SELECT 1 FROM conversations WHERE workspace_id = ws_id AND contact_id = c.id AND channel = 'WHATSAPP');

        -- Create messages for Juan's conversation
        INSERT INTO messages (conversation_id, workspace_id, channel, direction, body, status, sent_at)
        SELECT conv.id, conv.workspace_id, conv.channel, 'INBOUND', 'Hola, quería información sobre sus servicios', 'DELIVERED', NOW() - INTERVAL '10 minutes'
        FROM conversations conv
        JOIN contacts c ON c.id = conv.contact_id
        WHERE conv.workspace_id = ws_id AND c.email = 'juan@perez.com'
        AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = conv.id);

        INSERT INTO messages (conversation_id, workspace_id, channel, direction, body, status, sent_at)
        SELECT conv.id, conv.workspace_id, conv.channel, 'OUTBOUND', 'Hola Juan! Thank you for contacting us. How can I help you?', 'READ', NOW() - INTERVAL '5 minutes'
        FROM conversations conv
        JOIN contacts c ON c.id = conv.contact_id
        WHERE conv.workspace_id = ws_id AND c.email = 'juan@perez.com'
        AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = conv.id AND m.direction = 'OUTBOUND');

        INSERT INTO messages (conversation_id, workspace_id, channel, direction, body, status, sent_at)
        SELECT conv.id, conv.workspace_id, conv.channel, 'INBOUND', 'Necesito cotizar un servicio de desarrollo web', 'READ', NOW() - INTERVAL '2 minutes'
        FROM conversations conv
        JOIN contacts c ON c.id = conv.contact_id
        WHERE conv.workspace_id = ws_id AND c.email = 'juan@perez.com'
        AND NOT EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = conv.id AND m.body LIKE '%cotizar%');
    END IF;
END $$;
