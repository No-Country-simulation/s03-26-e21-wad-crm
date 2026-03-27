package com.crm.module.settings.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para POST /api/settings/integrations/whatsapp
 * Requisito: 19.1
 */
public record WhatsAppConfigRequest(
        @NotBlank String phoneNumberId,
        @NotBlank String accessToken,
        @NotBlank String webhookVerifyToken
) {}
