package com.crm.module.whatsapp.dto;

import com.crm.module.conversation.entity.MessageStatus;

import java.util.UUID;

/**
 * Respuesta al enviar un mensaje de WhatsApp.
 * Requisito: 21.1–21.3
 */
public record SendWhatsAppResponse(
        UUID messageId,
        String externalId,
        MessageStatus status
) {}
