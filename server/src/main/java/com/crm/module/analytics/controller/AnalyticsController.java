package com.crm.module.analytics.controller;

import com.crm.module.analytics.dto.DashboardDto;
import com.crm.module.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador de métricas y KPIs del dashboard.
 * Requisitos: 31.1, 31.4
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/analytics/dashboard — retorna KPIs del workspace.
     * Acceso restringido a ADMIN y MANAGER (SALES → 403). Req 31.1, 31.4
     *
     * @param period período de análisis: 7d, 30d, 90d (default 30d)
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(
            @RequestParam(required = false, defaultValue = "30d") String period,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        DashboardDto dashboard = analyticsService.getDashboard(workspaceId, period);
        return ResponseEntity.ok(dashboard);
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
