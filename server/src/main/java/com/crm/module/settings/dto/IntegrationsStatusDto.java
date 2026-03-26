package com.crm.module.settings.dto;

/**
 * DTO de respuesta para GET /api/settings/integrations.
 * No expone tokens ni credenciales en texto plano.
 * Requisito: 19.4
 */
public record IntegrationsStatusDto(
        WhatsAppStatus whatsapp,
        EmailStatus email
) {

    public record WhatsAppStatus(
            boolean connected,
            /** phoneNumberId — no es un secreto, es seguro exponer */
            String phoneNumberId,
            String connectedAt
    ) {}

    public record EmailStatus(
            boolean connected,
            /** "SMTP" o "GMAIL" */
            String type,
            /** host SMTP o email de Gmail — nunca la contraseña ni tokens */
            String identifier
    ) {}
}
