package com.crm.module.whatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * DTO para POST /api/whatsapp/send
 */
public record SendWhatsAppRequest(
        @NotNull UUID contactId,
        @NotBlank String body
) {}
