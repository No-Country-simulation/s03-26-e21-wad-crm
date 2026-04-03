package com.crm.config;

import com.crm.common.security.EncryptionService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.WhatsAppProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.crm.module.workspace.entity.Workspace;
import com.crm.module.workspace.repository.WorkspaceRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Initializes development data on startup.
 * Only active when 'dev' or 'local' profile is enabled.
 *
 * Creates:
 * - Default workspace if none exists
 * - WhatsApp config from .env credentials (encrypted)
 */
@Slf4j
@Component
@Profile({ "dev", "local" })
@RequiredArgsConstructor
public class DevDataInitializer {

    private final WorkspaceRepository workspaceRepository;
    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final AppProperties appProperties;
    private final EncryptionService encryptionService;
    private final WhatsAppProvider whatsAppProvider;

    @PostConstruct
    void init() {
        log.info("=== DevDataInitializer: checking development data ===");

        UUID workspaceId = ensureDefaultWorkspace();
        ensureWhatsAppConfig(workspaceId);

        log.info("=== DevDataInitializer: development data ready ===");
    }

    private UUID ensureDefaultWorkspace() {
        var existing = workspaceRepository.findAll();
        if (!existing.isEmpty()) {
            UUID id = existing.get(0).getId();
            log.info("Workspace exists: {} ({})", existing.get(0).getName(), id);
            return id;
        }

        Workspace ws = Workspace.builder()
                .name("Dev Workspace")
                .slug("dev-workspace")
                .timezone("America/Argentina/Buenos_Aires")
                .plan("free")
                .build();
        workspaceRepository.save(ws);
        log.info("Created default workspace: {} (id={})", ws.getName(), ws.getId());
        return ws.getId();
    }

    private void ensureWhatsAppConfig(UUID workspaceId) {
        AppProperties.WhatsApp wa = appProperties.getWhatsApp();

        if (wa.getAccessToken() == null || wa.getAccessToken().isBlank()
                || wa.getPhoneNumberId() == null || wa.getPhoneNumberId().isBlank()) {
            log.warn("WhatsApp dev credentials not configured (WA_ACCESS_TOKEN / WA_PHONE_NUMBER_ID missing in .env)");
            return;
        }

        var existing = whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId);
        if (existing.isPresent()) {
            log.info("WhatsApp config already active for workspace {} (phone: {})",
                    workspaceId, existing.get().getPhoneNumberId());
            return;
        }

        // Verify connection with Meta before saving
        WhatsAppConfig testConfig = new WhatsAppConfig();
        testConfig.setWorkspaceId(workspaceId);
        testConfig.setPhoneNumberId(wa.getPhoneNumberId());
        testConfig.setAccessToken(wa.getAccessToken());

        try {
            whatsAppProvider.verifyConnection(testConfig);
            log.info("WhatsApp connection verified for phoneNumberId={}", wa.getPhoneNumberId());
        } catch (Exception e) {
            log.warn("WhatsApp connection verification failed: {} — saving config anyway for dev", e.getMessage());
        }

        // Deactivate any existing inactive configs
        whatsAppConfigRepository.findByWorkspaceId(workspaceId).stream()
                .forEach(c -> {
                    c.setActive(false);
                    whatsAppConfigRepository.save(c);
                });

        // Save with encrypted credentials
        WhatsAppConfig config = new WhatsAppConfig();
        config.setWorkspaceId(workspaceId);
        config.setPhoneNumberId(wa.getPhoneNumberId());
        config.setAccessToken(encryptionService.encrypt(wa.getAccessToken()));
        config.setWebhookVerifyToken(encryptionService.encrypt(
                wa.getWebhookVerifyToken() != null ? wa.getWebhookVerifyToken() : "dev-verify-token"));
        config.setAppSecret(wa.getAppSecret() != null && !wa.getAppSecret().isBlank()
                ? encryptionService.encrypt(wa.getAppSecret())
                : null);
        config.setConnectedAt(LocalDateTime.now());
        config.setActive(true);

        whatsAppConfigRepository.save(config);
        log.info("WhatsApp config saved for workspace {} (phone: {})", workspaceId, wa.getPhoneNumberId());
    }
}
