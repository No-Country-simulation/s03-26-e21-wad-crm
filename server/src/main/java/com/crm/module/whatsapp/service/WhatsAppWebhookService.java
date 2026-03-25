package com.crm.module.whatsapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Procesa los payloads entrantes del webhook de Meta Cloud API.
 * - Identifica contacto por teléfono en el workspace
 * - Crea contacto nuevo si no existe (estado NEW)
 * - Delega persistencia del mensaje a ConversationService
 * - Garantiza idempotencia por externalId
 * Implementación completa en tarea 9.3.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppWebhookService {
    // Implementación en tarea 9.3
}
