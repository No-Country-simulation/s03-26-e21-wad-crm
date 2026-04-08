package com.crm.module.whatsapp.service;

import com.crm.common.security.EncryptionService;
import com.crm.config.AppProperties;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.WhatsAppProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Auto-configures WhatsApp for user workspaces on first login.
 * MVP solution: Each workspace gets automatic WhatsApp config using shared .env credentials.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppAutoConfigService {

    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final AppProperties appProperties;
    private final EncryptionService encryptionService;
    private final WhatsAppProvider whatsAppProvider;

    /**
     * Ensures the workspace has an active WhatsApp configuration.
     * If not, creates one using .env credentials.
     * 
     * MVP Strategy: All workspaces share the same WhatsApp Business phone number.
     * This works for development and small-scale deployment.
     * 
     * @param workspaceId The workspace to configure
     */
    @Transactional
    public void ensureWhatsAppConfigForWorkspace(UUID workspaceId) {
        // Check if workspace already has active WhatsApp config
        var existingConfig = whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId);
        if (existingConfig.isPresent()) {
            log.debug("Workspace {} already has active WhatsApp config", workspaceId);
            return;
        }

        // Check if .env has WhatsApp credentials
        AppProperties.WhatsApp wa = appProperties.getWhatsApp();
        if (wa.getAccessToken() == null || wa.getAccessToken().isBlank()
                || wa.getPhoneNumberId() == null || wa.getPhoneNumberId().isBlank()) {
            log.warn("WhatsApp credentials not configured in .env - skipping auto-config for workspace {}", workspaceId);
            return;
        }

        log.info("Auto-configuring WhatsApp for workspace {} using shared credentials", workspaceId);

        // CRITICAL: Deactivate ALL other configs with the same phone_number_id
        // In MVP mode, only ONE workspace can have active config per phone number
        deactivateOtherConfigs(wa.getPhoneNumberId(), workspaceId);

        // Create new config for this workspace
        createWhatsAppConfig(workspaceId, wa);

        log.info("✅ WhatsApp auto-configured for workspace {}", workspaceId);
    }

    /**
     * Deactivates all WhatsApp configs with the same phone number except for the given workspace.
     * MVP limitation: One phone number can only be active for one workspace at a time.
     */
    private void deactivateOtherConfigs(String phoneNumberId, UUID targetWorkspaceId) {
        var conflictingConfigs = whatsAppConfigRepository.findByPhoneNumberId(phoneNumberId).stream()
                .filter(config -> config.isActive() && !config.getWorkspaceId().equals(targetWorkspaceId))
                .toList();

        for (var config : conflictingConfigs) {
            log.info("Deactivating conflicting WhatsApp config: workspace={}, phone={}", 
                     config.getWorkspaceId(), config.getPhoneNumberId());
            config.setActive(false);
            whatsAppConfigRepository.save(config);
        }
    }

    /**
     * Creates a new WhatsApp configuration for the workspace.
     */
    private void createWhatsAppConfig(UUID workspaceId, AppProperties.WhatsApp wa) {
        // Create test config for connection verification
        WhatsAppConfig testConfig = new WhatsAppConfig();
        testConfig.setWorkspaceId(workspaceId);
        testConfig.setPhoneNumberId(wa.getPhoneNumberId());
        testConfig.setAccessToken(wa.getAccessToken());

        // Try to verify connection (non-blocking)
        try {
            whatsAppProvider.verifyConnection(testConfig);
            log.info("WhatsApp connection verified for workspace {}", workspaceId);
        } catch (Exception e) {
            log.warn("WhatsApp connection verification failed for workspace {}: {} — creating config anyway", 
                     workspaceId, e.getMessage());
        }

        // Save encrypted config
        WhatsAppConfig config = new WhatsAppConfig();
        config.setWorkspaceId(workspaceId);
        config.setPhoneNumberId(wa.getPhoneNumberId());
        config.setAccessToken(encryptionService.encrypt(wa.getAccessToken()));
        config.setWebhookVerifyToken(encryptionService.encrypt(
                wa.getWebhookVerifyToken() != null ? wa.getWebhookVerifyToken() : "auto-config-verify-token"));
        config.setAppSecret(wa.getAppSecret() != null && !wa.getAppSecret().isBlank()
                ? encryptionService.encrypt(wa.getAppSecret())
                : null);
        config.setConnectedAt(LocalDateTime.now());
        config.setActive(true);

        whatsAppConfigRepository.save(config);
        log.info("WhatsApp config saved for workspace {} (phone: {})", workspaceId, wa.getPhoneNumberId());
    }
}