package com.crm.module.deal.controller;

import com.crm.module.deal.dto.PipelineSummaryDto;
import com.crm.module.deal.service.DealService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador de deals y pipeline.
 * Requisitos: 14.1, 15.1, 16.1, 17.1, 18.1
 */
@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    /**
     * GET /api/deals/pipeline/summary — resumen del pipeline.
     * Acceso restringido a ADMIN y MANAGER (SALES → 403). Req 18.1
     *
     * Propiedad 8: summary.total == Σ deal.value ∀ deal: !deal.isDeleted
     */
    @GetMapping("/pipeline/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PipelineSummaryDto> getPipelineSummary(Principal principal) {
        UUID workspaceId = extractWorkspaceId(principal);
        return ResponseEntity.ok(dealService.getPipelineSummary(workspaceId));
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
