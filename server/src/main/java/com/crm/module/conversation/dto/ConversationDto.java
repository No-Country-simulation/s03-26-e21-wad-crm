package com.crm.module.conversation.dto;

import com.crm.module.conversation.entity.MessageChannel;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de conversación.
 * Requisitos: 22.1, 22.4
 */
public record ConversationDto(
        UUID id,
        UUID contactId,
        MessageChannel channel,
        LocalDateTime lastMessageAt,
        UUID workspaceId,
        LocalDateTime createdAt
) {}
