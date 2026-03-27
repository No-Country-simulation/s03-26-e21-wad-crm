package com.crm.module.settings.controller;

import com.crm.module.settings.dto.IntegrationsStatusDto;
import com.crm.module.settings.dto.WhatsAppConfigRequest;
import com.crm.module.settings.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

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

    /**
     * GET /api/settings/integrations
     * Retorna el estado de WhatsApp y Email sin exponer tokens.
     * Requisito: 19.4
     */
    @GetMapping
    public ResponseEntity<IntegrationsStatusDto> getIntegrationsStatus(Principal principal) {
        UUID workspaceId = extractWorkspaceId(principal);
        return ResponseEntity.ok(settingsService.getIntegrationsStatus(workspaceId));
    }

    /**
     * POST /api/settings/integrations/whatsapp
     * Guarda la configuración de WhatsApp tras verificar con Meta Cloud API.
     * Requisitos: 19.1, 19.2, 19.3
     */
    @PostMapping("/whatsapp")
    public ResponseEntity<?> saveWhatsAppConfig(
            @Valid @RequestBody WhatsAppConfigRequest request,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        try {
            IntegrationsStatusDto status = settingsService.saveWhatsAppConfig(workspaceId, request);
            return ResponseEntity.ok(status);
        } catch (SettingsService.WhatsAppVerificationException e) {
            // Requisito 19.3: HTTP 422 cuando la verificación con Meta falla
            return ResponseEntity.unprocessableEntity()
                    .body(Map.of("error", "whatsapp_verification_failed", "message", e.getMessage()));
        }
    }

    /**
     * DELETE /api/settings/integrations/whatsapp
     * Desconecta WhatsApp y elimina las credenciales del workspace.
     * Requisito: 35.2
     */
    @DeleteMapping("/whatsapp")
    public ResponseEntity<Void> disconnectWhatsApp(Principal principal) {
        UUID workspaceId = extractWorkspaceId(principal);
        settingsService.disconnectWhatsApp(workspaceId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/settings/integrations/email
     * Desconecta la integración de email activa (SMTP o Gmail).
     * Requisito: 35.3
     */
    @DeleteMapping("/email")
    public ResponseEntity<Void> disconnectEmail(Principal principal) {
        UUID workspaceId = extractWorkspaceId(principal);
        settingsService.disconnectEmail(workspaceId);
        return ResponseEntity.noContent().build();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private UUID extractWorkspaceId(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Usuario no autenticado");
        }
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
                "'workspaceId' no disponible en el contexto. Asegúrese de que WorkspaceFilter esté configurado.");
    }
}
