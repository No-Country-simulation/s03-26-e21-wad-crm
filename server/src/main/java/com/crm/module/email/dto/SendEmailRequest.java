package com.crm.module.email.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * DTO para POST /api/email/send
 * Requisito: 25.1, 25.4
 */
public record SendEmailRequest(
        @NotNull UUID contactId,
        @NotBlank String subject,
        @NotBlank String body,
        List<String> cc,
        List<String> bcc,
        UUID templateId
) {}
