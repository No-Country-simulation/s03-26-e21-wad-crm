package com.crm.module.analytics.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.analytics.dto.DashboardDto;
import com.crm.module.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
            @RequestParam(required = false, defaultValue = "30d") String period) {
        DashboardDto dashboard = analyticsService.getDashboard(WorkspaceContext.getWorkspaceId(), period);
        return ResponseEntity.ok(dashboard);
    }
}
