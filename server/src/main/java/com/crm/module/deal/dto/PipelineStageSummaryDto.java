package com.crm.module.deal.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Resumen de una etapa del pipeline: cantidad de deals y suma de valores.
 * Requisitos: 17.2, 18.2
 */
public record PipelineStageSummaryDto(
        UUID stageId,
        String stageName,
        long dealCount,
        BigDecimal totalValue,
        boolean isWon,
        boolean isLost
) {}
