package com.crm.module.settings.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.settings.dto.IntegrationsStatusDto;
import com.crm.module.settings.dto.WhatsAppConfigRequest;
import com.crm.module.settings.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador de configuración de integraciones del workspace.
 * Todos los endpoints son ADMIN only.
 * Requisitos: 19.1–19.4, 35.1–35.4
 */
@Slf4j
@RestController
@RequestMapping("/api/settings/integrations")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<IntegrationsStatusDto> getIntegrationsStatus() {
        return ResponseEntity.ok(settingsService.getIntegrationsStatus(WorkspaceContext.getWorkspaceId()));
    }

    @PostMapping("/whatsapp")
    public ResponseEntity<?> saveWhatsAppConfig(@Valid @RequestBody WhatsAppConfigRequest request) {
        try {
            IntegrationsStatusDto status = settingsService.saveWhatsAppConfig(WorkspaceContext.getWorkspaceId(), request);
            return ResponseEntity.ok(status);
        } catch (SettingsService.WhatsAppVerificationException e) {
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", "whatsapp_verification_failed", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/whatsapp")
    public ResponseEntity<Void> disconnectWhatsApp() {
        settingsService.disconnectWhatsApp(WorkspaceContext.getWorkspaceId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/email")
    public ResponseEntity<Void> disconnectEmail() {
        settingsService.disconnectEmail(WorkspaceContext.getWorkspaceId());
        return ResponseEntity.noContent().build();
    }
}
