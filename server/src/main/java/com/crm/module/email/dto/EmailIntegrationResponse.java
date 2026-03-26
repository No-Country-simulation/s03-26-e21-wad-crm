package com.crm.module.email.dto;

/**
 * DTO de respuesta para el estado de la integración de email.
 * No expone credenciales en texto plano.
 * Requisito: 19.4
 */
public record EmailIntegrationResponse(
        String type,
        boolean connected,
        /** Email (Gmail) o host SMTP — nunca la contraseña */
        String identifier
) {}
