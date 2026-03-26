package com.crm.module.conversation.dto;

import java.util.UUID;

/**
 * Payload enviado por WebSocket al recibir un mensaje nuevo.
 * Requisitos: 21.5, 22.3
 */
public record ConversationNotification(
        UUID conversationId,
        MessageDto lastMessage,
        UUID workspaceId
) {}
