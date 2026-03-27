package com.crm.module.deal.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resumen completo del pipeline: total, ganados, perdidos y desglose por etapa.
 * Requisitos: 17.2, 18.1–18.4
 */
public record PipelineSummaryDto(
        BigDecimal total,
        BigDecimal wonTotal,
        BigDecimal lostTotal,
        long totalDeals,
        List<PipelineStageSummaryDto> stages
) {}
