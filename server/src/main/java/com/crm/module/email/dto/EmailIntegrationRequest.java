package com.crm.module.email.dto;

import com.crm.module.email.entity.EmailEncryption;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para POST /api/settings/integrations/email
 * Requisitos: 23.1, 24.1
 */
public record EmailIntegrationRequest(
        @NotNull IntegrationType type,
        String host,
        Integer port,
        String username,
        String password,
        EmailEncryption encryption
) {
    public enum IntegrationType {
        SMTP,
        GMAIL
    }
}
