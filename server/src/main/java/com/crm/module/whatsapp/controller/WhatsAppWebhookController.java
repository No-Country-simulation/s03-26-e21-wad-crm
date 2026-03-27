package com.crm.module.whatsapp.controller;

import com.crm.module.whatsapp.provider.WhatsAppProvider;
import com.crm.module.whatsapp.service.WhatsAppWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos del webhook de Meta Cloud API.
 * GET  /webhooks/whatsapp  → verificación hub.challenge
 * POST /webhooks/whatsapp  → recepción de mensajes entrantes
 * Requisitos: 20.1, 20.5, 20.6
 */
@Slf4j
@RestController
@RequestMapping("/webhooks/whatsapp")
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    private final WhatsAppProvider whatsAppProvider;
    private final WhatsAppWebhookService webhookService;

    /** Verificación de webhook por Meta (hub.challenge) */
    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String verifyToken,
            @RequestParam("hub.challenge") String challenge) {
        // Implementación completa en tarea 9.4
        log.info("Meta webhook verification request received");
        return ResponseEntity.ok(challenge);
    }

    /** Recepción de mensajes entrantes de Meta */
    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestBody String payload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature) {
        // Implementación completa en tarea 9.4
        log.info("Meta webhook message received");
        return ResponseEntity.ok().build();
    }
}
