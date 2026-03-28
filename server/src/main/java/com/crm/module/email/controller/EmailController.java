package com.crm.module.email.controller;

import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.email.dto.*;
import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.EmailEncryption;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.provider.GmailOAuthProvider;
import com.crm.module.email.provider.SmtpEmailProvider;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.repository.GmailConfigRepository;
import com.crm.module.email.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Controlador de email: envío y gestión de integraciones SMTP/Gmail.
 * Requisitos: 23.1, 24.1, 25.1
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;
    private final EmailConfigRepository emailConfigRepository;
    private final GmailConfigRepository gmailConfigRepository;
    private final SmtpEmailProvider smtpEmailProvider;
    private final GmailOAuthProvider gmailOAuthProvider;
    private final ContactRepository contactRepository;

    /**
     * POST /api/email/send — enviar email a un contacto.
     * Requisito: 25.1
     */
    @PostMapping("/api/email/send")
    public ResponseEntity<Void> sendEmail(
            @Valid @RequestBody SendEmailRequest request,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);

        // Resolve contact email address
        String toEmail = contactRepository.findByWorkspaceIdAndIdAndDeletedFalse(workspaceId, request.contactId())
                .map(c -> c.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Contacto no encontrado: " + request.contactId()));

        EmailMessage message = new EmailMessage(
                request.contactId(),
                toEmail,
                request.subject(),
                request.body(),
                request.cc(),
                request.bcc(),
                request.templateId(),
                null,
                null
        );

        emailService.send(workspaceId, message);
        return ResponseEntity.accepted().build(); // HTTP 202
    }

    /**
     * POST /api/settings/integrations/email — configurar integración SMTP o iniciar OAuth Gmail.
     * ADMIN only. Requisitos: 23.1, 23.2, 23.3, 24.1
     */
    @PostMapping("/api/settings/integrations/email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> configureEmailIntegration(
            @Valid @RequestBody EmailIntegrationRequest request,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);

        if (request.type() == EmailIntegrationRequest.IntegrationType.GMAIL) {
            String authUrl = gmailOAuthProvider.getAuthorizationUrl(workspaceId.toString());
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        }

        // SMTP flow
        if (request.host() == null || request.port() == null
                || request.username() == null || request.password() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "host, port, username y password son requeridos para SMTP"));
        }

        EmailConfig config = new EmailConfig();
        config.setWorkspaceId(workspaceId);
        config.setHost(request.host());
        config.setPort(request.port());
        config.setUsername(request.username());
        // TODO: cifrar password con EncryptionService (AES-256) cuando esté disponible
        config.setPassword(request.password());
        config.setEncryption(request.encryption() != null ? request.encryption() : EmailEncryption.TLS);
        config.setActive(true);

        // Test connection before saving (Requisito 23.2, 23.3)
        try {
            smtpEmailProvider.withConfig(config).testConnection();
        } catch (RuntimeException e) {
            log.warn("SMTP test connection failed for workspace {}: {}", workspaceId, e.getMessage());
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", e.getMessage()));
        }

        // Deactivate any existing SMTP config
        emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId)
                .ifPresent(existing -> {
                    existing.setActive(false);
                    emailConfigRepository.save(existing);
                });

        emailConfigRepository.save(config);
        log.info("SMTP config saved for workspace {}", workspaceId);

        return ResponseEntity.ok(Map.of(
                "type", "SMTP",
                "connected", true,
                "host", request.host()
        ));
    }

    /**
     * GET /api/settings/integrations/email/oauth/callback — callback OAuth de Gmail.
     * Público. Requisito: 24.2
     */
    @GetMapping("/api/settings/integrations/email/oauth/callback")
    public ResponseEntity<Map<String, Object>> gmailOAuthCallback(
            @RequestParam String code,
            @RequestParam String state) {

        UUID workspaceId = UUID.fromString(state);
        GmailConfig config = gmailOAuthProvider.handleCallback(code, workspaceId.toString());

        log.info("Gmail OAuth callback completed for workspace {}, email {}", workspaceId, config.getEmail());
        return ResponseEntity.ok(Map.of(
                "type", "GMAIL",
                "connected", true,
                "email", config.getEmail()
        ));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Extracts workspaceId from the JWT principal.
     * WorkspaceContext (ThreadLocal) will be used once that infrastructure is in place.
     * For now falls back to parsing the principal name as UUID or using a placeholder.
     */
    private UUID extractWorkspaceId(Principal principal) {
        // TODO: replace with WorkspaceContext.get() once WorkspaceFilter is implemented (task 2.2)
        // The JWT filter will inject workspaceId into WorkspaceContext before reaching this controller.
        // Temporary: attempt to read from security context details if available.
        if (principal == null) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        // WorkspaceContext.get() will be the real implementation; this is a compile-safe stub
        try {
            var auth = (org.springframework.security.core.Authentication) principal;
            Object details = auth.getDetails();
            if (details instanceof Map<?, ?> map && map.containsKey("workspaceId")) {
                return UUID.fromString(map.get("workspaceId").toString());
            }
        } catch (Exception ignored) {
            // fall through
        }
        throw new IllegalStateException(
                "workspaceId no disponible en el contexto. Asegúrese de que WorkspaceFilter esté configurado.");
    }
}
