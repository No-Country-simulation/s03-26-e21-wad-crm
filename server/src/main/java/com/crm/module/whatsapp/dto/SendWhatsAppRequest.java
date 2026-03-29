package com.crm.module.whatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request para enviar un mensaje de WhatsApp a un contacto.
 * Requisito: 21.1
 */
public record SendWhatsAppRequest(
        @NotNull UUID contactId,
        @NotBlank String body
) {}
