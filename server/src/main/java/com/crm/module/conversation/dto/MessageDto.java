package com.crm.module.conversation.dto;

import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de mensaje.
 * Requisitos: 22.2, 22.3
 */
public record MessageDto(
        UUID id,
        UUID conversationId,
        String body,
        MessageDirection direction,
        MessageChannel channel,
        MessageStatus status,
        String externalId,
        LocalDateTime sentAt,
        LocalDateTime deliveredAt,
        LocalDateTime readAt,
        String type,
        String mediaUrl,
        String mimeType,
        String caption
) {}
