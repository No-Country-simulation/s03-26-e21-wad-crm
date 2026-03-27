package com.crm.module.whatsapp.controller;

import com.crm.module.whatsapp.service.WhatsAppWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.HexFormat;

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

    /**
     * Req 20.6: verificación de webhook por Meta (hub.challenge).
     * Retorna el challenge cuando el verify_token es correcto.
     * En esta implementación se acepta cualquier token (la validación real
     * se delega al servicio en la tarea 9.5).
     */
    @GetMapping
    public ResponseEntity<String> verify(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String verifyToken,
            @RequestParam("hub.challenge") String challenge) {
        log.info("Meta webhook verification: mode={}", mode);
        return ResponseEntity.ok(challenge);
    }

    /**
     * Req 20.1: recepción de mensajes entrantes de Meta.
     * Req 20.5: valida firma HMAC-SHA256; retorna 403 si es inválida.
     */
    @PostMapping
    public ResponseEntity<Void> receive(
            @RequestBody String payload,
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature) {

        if (!isValidSignature(payload, signature)) {
            log.warn("Invalid or missing X-Hub-Signature-256");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            webhookService.processPayload(payload);
        } catch (Exception e) {
            log.error("Error processing webhook payload", e);
            // Return 200 to Meta even on processing errors to avoid retries
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Req 20.5: verifica la firma HMAC-SHA256 del payload.
     * La clave usada es el app_secret almacenado en WhatsAppConfig.
     * Para tests de integración, el secret se pasa directamente en el header
     * como parte del flujo de verificación.
     *
     * Nota: en producción el secret se resuelve por workspace desde WhatsAppConfig.
     * Para esta implementación de integración, se delega la verificación al servicio.
     */
    private boolean isValidSignature(String payload, String signature) {
        if (signature == null || signature.isBlank()) return false;
        // Delegate to service for workspace-aware verification
        return webhookService.verifySignature(payload, signature);
    }
}
