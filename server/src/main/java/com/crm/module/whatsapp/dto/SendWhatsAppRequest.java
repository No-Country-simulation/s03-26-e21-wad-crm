package com.crm.module.whatsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request para enviar un mensaje de WhatsApp a un contacto.
 * Soporta mensajes de texto y templates.
 * Requisito: 21.1
 */
public record SendWhatsAppRequest(
        @NotNull UUID contactId,
        @NotBlank String body,

        // Template fields (optional — if set, sends a template message)
        String templateName,
        String templateLanguage,
        List<TemplateParameter> templateParameters
) {
    /**
     * Parameter for template message body variables.
     * Example: { "type": "text", "value": "John" }
     */
    public record TemplateParameter(
            @NotBlank String type,
            @NotBlank String value
    ) {}
}
