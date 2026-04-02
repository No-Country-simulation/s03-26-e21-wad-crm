package com.crm.module.whatsapp.controller;

import com.crm.common.security.EncryptionService;
import com.crm.config.AppProperties;
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
    private final AppProperties appProperties;

    /**
     * Req 20.6: verificación de webhook por Meta (hub.challenge).
     * Valida que hub.verify_token coincida con el webhookVerifyToken almacenado
     * para algún workspace activo O con la variable de entorno WA_WEBHOOK_VERIFY_TOKEN.
     * Retorna hub.challenge si es válido.
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

        // First check against the env variable (for initial Meta verification)
        String envToken = appProperties.getWhatsApp().getWebhookVerifyToken();
        if (envToken != null && !envToken.isBlank() && verifyToken.equals(envToken)) {
            log.info("Meta webhook verification successful (matched env token)");
            return ResponseEntity.ok(challenge);
        }

        // Then check against all active workspace configs
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

        log.info("Meta webhook verification successful (matched DB config)");
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

        log.info("[WA-WEBHOOK] POST received: signature={}, payloadLength={}",
                signature != null ? "present" : "missing", payload != null ? payload.length() : 0);

        if (signature == null || signature.isBlank()) {
            log.warn("[WA-WEBHOOK] Missing X-Hub-Signature-256 header — rejecting");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!webhookService.verifySignature(payload, signature)) {
            log.warn("[WA-WEBHOOK] Invalid X-Hub-Signature-256 — rejecting");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        log.info("[WA-WEBHOOK] Signature verified OK — processing payload");

        // Process asynchronously-safe: return 200 immediately, process in transaction
        try {
            webhookService.processPayload(payload);
            log.info("[WA-WEBHOOK] Payload processed successfully");
        } catch (Exception e) {
            // Log but still return 200 to prevent Meta retries for processing errors
            log.error("[WA-WEBHOOK] Error processing payload: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok().build();
    }
}
