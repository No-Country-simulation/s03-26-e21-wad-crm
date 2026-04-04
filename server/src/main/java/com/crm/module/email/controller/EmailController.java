package com.crm.module.email.controller;

import com.crm.common.security.WorkspaceContext;
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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Email", description = "Envío y configuración de integraciones de email")
public class EmailController {

    private final EmailService emailService;
    private final EmailConfigRepository emailConfigRepository;
    private final GmailConfigRepository gmailConfigRepository;
    private final SmtpEmailProvider smtpEmailProvider;
    private final GmailOAuthProvider gmailOAuthProvider;
    private final ContactRepository contactRepository;

    @Operation(summary = "Enviar email a un contacto")
    @PostMapping("/api/email/send")
    public ResponseEntity<Void> sendEmail(@Valid @RequestBody SendEmailRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

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
        return ResponseEntity.accepted().build();
    }

    @Operation(summary = "Configurar integración de email (SMTP o Gmail OAuth)")
    @PostMapping("/api/settings/integrations/email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> configureEmailIntegration(
            @Valid @RequestBody EmailIntegrationRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        if (request.type() == EmailIntegrationRequest.IntegrationType.GMAIL) {
            String authUrl = gmailOAuthProvider.getAuthorizationUrl(workspaceId.toString());
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        }

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
        config.setPassword(request.password());
        config.setEncryption(request.encryption() != null ? request.encryption() : EmailEncryption.TLS);
        config.setActive(true);

        try {
            smtpEmailProvider.withConfig(config).testConnection();
        } catch (RuntimeException e) {
            log.warn("SMTP test connection failed for workspace {}: {}", workspaceId, e.getMessage());
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", e.getMessage()));
        }

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

    @Operation(summary = "Callback OAuth de Gmail (uso interno)")
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
}
