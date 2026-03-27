package com.crm.module.analytics.dto;

import java.math.BigDecimal;

/**
 * KPIs del dashboard de métricas.
 * Requisitos: 31.1–31.5
 */
public record DashboardDto(
        long activeContacts,
        long activeDeals,
        BigDecimal pipelineValue,
        double conversionRate,
        String period
) {}
