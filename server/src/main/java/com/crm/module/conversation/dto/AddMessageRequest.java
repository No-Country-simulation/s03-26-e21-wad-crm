package com.crm.module.conversation.dto;

import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Request para agregar un mensaje a una conversación.
 * Requisitos: 21.5, 22.2
 */
public record AddMessageRequest(
        @NotNull UUID conversationId,
        String body,
        @NotNull MessageDirection direction,
        @NotNull MessageChannel channel,
        MessageStatus status,
        String externalId,
        LocalDateTime sentAt
) {}
