package com.crm.module.whatsapp.controller;

import com.crm.common.security.EncryptionService;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.crm.module.whatsapp.service.WhatsAppWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints públicos del webhook de Meta Cloud API.
 * GET  /webhooks/whatsapp  → verificación hub.challenge  (Req 20.6)
 * POST /webhooks/whatsapp  → recepción de mensajes       (Req 20.1, 20.5)
 */
@Slf4j
@RestController
@RequestMapping("/webhooks/whatsapp")
@RequiredArgsConstructor
public class WhatsAppWebhookController {

    private final WhatsAppWebhookService webhookService;
    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final EncryptionService encryptionService;

    /**
     * Req 20.6: verificación de webhook por Meta (hub.challenge).
     * Valida que hub.verify_token coincida con el webhookVerifyToken almacenado
     * para algún workspace activo. Retorna hub.challenge si es válido.
     */
    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String verifyToken,
            @RequestParam("hub.challenge") String challenge) {

        if (!"subscribe".equals(mode)) {
            log.warn("Unexpected hub.mode: {}", mode);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Validate verify_token against all active workspace configs
        boolean valid = whatsAppConfigRepository.findAll().stream()
                .filter(c -> c.isActive() && c.getWebhookVerifyToken() != null)
                .anyMatch(c -> {
                    try {
                        String stored = encryptionService.decrypt(c.getWebhookVerifyToken());
                        return verifyToken.equals(stored);
                    } catch (Exception e) {
                        log.warn("Failed to decrypt webhookVerifyToken for config {}", c.getId());
                        return false;
                    }
                });

        if (!valid) {
            log.warn("Invalid hub.verify_token received");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("Meta webhook verification successful");
        return ResponseEntity.ok(challenge);
    }

    /**
     * Req 20.1: recepción de mensajes entrantes de Meta.
     * Req 20.5: valida firma HMAC-SHA256; retorna 403 si es inválida.
     * Retorna 200 inmediatamente para evitar reintentos de Meta.
     */
    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestBody String payload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature) {

        if (signature == null || signature.isBlank()) {
            log.warn("Missing X-Hub-Signature-256 header");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!webhookService.verifySignature(payload, signature)) {
            log.warn("Invalid X-Hub-Signature-256 — rejecting webhook");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Process asynchronously-safe: return 200 immediately, process in transaction
        try {
            webhookService.processPayload(payload);
        } catch (Exception e) {
            // Log but still return 200 to prevent Meta retries for processing errors
            log.error("Error processing webhook payload: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok().build();
    }
}
