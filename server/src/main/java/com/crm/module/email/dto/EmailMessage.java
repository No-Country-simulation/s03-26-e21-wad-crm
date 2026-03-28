package com.crm.module.email.dto;

import java.util.List;
import java.util.UUID;

/**
 * Mensaje de email a enviar.
 * Requisitos: 25.1, 25.4
 */
public record EmailMessage(
        UUID contactId,
        String to,
        String subject,
        String body,
        List<String> cc,
        List<String> bcc,
        UUID templateId,
        String inReplyTo,
        String references
) {}
