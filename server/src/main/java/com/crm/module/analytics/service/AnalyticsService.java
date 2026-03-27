package com.crm.module.analytics.service;

import com.crm.module.analytics.dto.DashboardDto;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de métricas y KPIs del dashboard.
 * Requisitos: 31.1–31.5
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;

    /**
     * Retorna los KPIs del dashboard para el workspace y período indicados.
     * Req 31.1, 31.2, 31.3, 31.5
     */
    @Transactional(readOnly = true)
    public DashboardDto getDashboard(UUID workspaceId, String period) {
        String resolvedPeriod = resolvePeriod(period);
        LocalDateTime startDate = LocalDateTime.now().minusDays(parseDays(resolvedPeriod));

        long activeContacts = contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId);
        long activeDeals = dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId);
        BigDecimal pipelineValue = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        long totalDealsInPeriod = dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(workspaceId, startDate);
        long wonDealsInPeriod = dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(workspaceId, startDate);

        // Req 31.2: conversionRate = (won / total) × 100; si total=0 → 0.0
        double conversionRate = totalDealsInPeriod == 0
                ? 0.0
                : (wonDealsInPeriod * 100.0) / totalDealsInPeriod;

        return new DashboardDto(activeContacts, activeDeals, pipelineValue, conversionRate, resolvedPeriod);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Normaliza el período: acepta "7d", "30d", "90d"; default "30d". Req 31.3
     */
    private String resolvePeriod(String period) {
        if ("7d".equals(period) || "90d".equals(period)) {
            return period;
        }
        return "30d";
    }

    private int parseDays(String period) {
        return switch (period) {
            case "7d"  -> 7;
            case "90d" -> 90;
            default    -> 30;
        };
    }
}
