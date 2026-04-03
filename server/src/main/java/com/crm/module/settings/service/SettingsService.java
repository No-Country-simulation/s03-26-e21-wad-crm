package com.crm.module.settings.service;

import com.crm.common.security.EncryptionService;
import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.provider.GmailOAuthProvider;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.repository.GmailConfigRepository;
import com.crm.module.settings.dto.IntegrationsStatusDto;
import com.crm.module.settings.dto.WhatsAppConfigRequest;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.WhatsAppProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de configuración del workspace: gestión de integraciones WhatsApp y Email.
 * Requisitos: 19.1–19.4, 35.1–35.4
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsService {

    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final EmailConfigRepository emailConfigRepository;
    private final GmailConfigRepository gmailConfigRepository;
    private final WhatsAppProvider whatsAppProvider;
    private final GmailOAuthProvider gmailOAuthProvider;
    private final EncryptionService encryptionService;

    /**
     * Retorna el estado actual de las integraciones sin exponer tokens.
     * Requisito: 19.4
     */
    public IntegrationsStatusDto getIntegrationsStatus(UUID workspaceId) {
        // WhatsApp status
        Optional<WhatsAppConfig> waConfig = whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId);
        IntegrationsStatusDto.WhatsAppStatus waStatus = waConfig
                .map(c -> new IntegrationsStatusDto.WhatsAppStatus(
                        true,
                        c.getPhoneNumberId(),
                        c.getConnectedAt() != null ? c.getConnectedAt().toString() : null))
                .orElse(new IntegrationsStatusDto.WhatsAppStatus(false, null, null));

        // Email status — Gmail takes priority over SMTP
        IntegrationsStatusDto.EmailStatus emailStatus;
        Optional<GmailConfig> gmailConfig = gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId);
        if (gmailConfig.isPresent()) {
            emailStatus = new IntegrationsStatusDto.EmailStatus(true, "GMAIL", gmailConfig.get().getEmail());
        } else {
            Optional<EmailConfig> smtpConfig = emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId);
            emailStatus = smtpConfig
                    .map(c -> new IntegrationsStatusDto.EmailStatus(true, "SMTP", c.getHost()))
                    .orElse(new IntegrationsStatusDto.EmailStatus(false, null, null));
        }

        return new IntegrationsStatusDto(waStatus, emailStatus);
    }

    /**
     * Guarda la configuración de WhatsApp tras verificar la conexión con Meta Cloud API.
     * Las credenciales se almacenan encriptadas con AES-256 (NFR-6).
     * Requisitos: 19.1, 19.2, 19.3
     */
    @Transactional
    public IntegrationsStatusDto saveWhatsAppConfig(UUID workspaceId, WhatsAppConfigRequest request) {
        // Build a transient config to verify before saving
        WhatsAppConfig config = new WhatsAppConfig();
        config.setWorkspaceId(workspaceId);
        config.setPhoneNumberId(request.phoneNumberId());
        // Use plain text for verification
        config.setAccessToken(request.accessToken());

        // Requisito 19.2: verify connection with Meta Cloud API before saving
        try {
            whatsAppProvider.verifyConnection(config);
        } catch (Exception e) {
            throw new WhatsAppVerificationException(
                    "No se pudo verificar la conexión con Meta Cloud API. " +
                    "Verifique que el phoneNumberId y accessToken sean correctos.");
        }

        // Deactivate any existing config for this workspace (must flush to DB before inserting new)
        whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId)
                .ifPresent(existing -> {
                    existing.setActive(false);
                    whatsAppConfigRepository.save(existing);
                    whatsAppConfigRepository.flush(); // Ensure deactivation is persisted before new insert
                });

        // Encrypt sensitive fields before persisting (NFR-6)
        config.setAccessToken(encryptionService.encrypt(request.accessToken()));
        config.setWebhookVerifyToken(encryptionService.encrypt(request.webhookVerifyToken()));
        config.setAppSecret(encryptionService.encrypt(request.appSecret()));
        config.setConnectedAt(LocalDateTime.now());
        config.setActive(true);

        whatsAppConfigRepository.save(config);
        log.info("WhatsApp config saved for workspace {}", workspaceId);

        return getIntegrationsStatus(workspaceId);
    }

    /**
     * Desconecta WhatsApp eliminando las credenciales del workspace.
     * Requisito: 35.2
     */
    @Transactional
    public void disconnectWhatsApp(UUID workspaceId) {
        whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId)
                .ifPresent(config -> {
                    config.setActive(false);
                    whatsAppConfigRepository.save(config);
                    log.info("WhatsApp integration disconnected for workspace {}", workspaceId);
                });
    }

    /**
     * Desconecta la integración de email activa (SMTP o Gmail).
     * Requisito: 35.3
     */
    @Transactional
    public void disconnectEmail(UUID workspaceId) {
        // Revoke Gmail if active
        Optional<GmailConfig> gmailConfig = gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId);
        if (gmailConfig.isPresent()) {
            gmailOAuthProvider.revokeTokens(gmailConfig.get());
            log.info("Gmail integration disconnected for workspace {}", workspaceId);
            return;
        }

        // Deactivate SMTP if active
        emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId)
                .ifPresent(config -> {
                    config.setActive(false);
                    emailConfigRepository.save(config);
                    log.info("SMTP integration disconnected for workspace {}", workspaceId);
                });
    }

    // ── Exceptions ───────────────────────────────────────────────────────────

    /**
     * Lanzada cuando la verificación con Meta Cloud API falla.
     * Requisito: 19.3 → HTTP 422
     */
    public static class WhatsAppVerificationException extends RuntimeException {
        public WhatsAppVerificationException(String message) {
            super(message);
        }
    }
}
