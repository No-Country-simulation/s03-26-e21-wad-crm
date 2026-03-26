package com.crm.module.deal.service;

import com.crm.module.deal.dto.PipelineStageSummaryDto;
import com.crm.module.deal.dto.PipelineSummaryDto;
import com.crm.module.deal.repository.DealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Servicio de oportunidades de venta y pipeline.
 * Requisitos: 14.1–14.5, 15.1–15.4, 16.1–16.4, 17.1–17.4, 18.1–18.4
 */
@Service
@RequiredArgsConstructor
public class DealService {

    private final DealRepository dealRepository;

    /**
     * Retorna el resumen del pipeline para el workspace dado.
     * Propiedad 8: summary.total == Σ deal.value ∀ deal: !deal.isDeleted
     * Requisitos: 17.2, 18.1–18.4
     */
    @Transactional(readOnly = true)
    public PipelineSummaryDto getPipelineSummary(UUID workspaceId) {
        BigDecimal total     = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);
        BigDecimal wonTotal  = dealRepository.sumWonValueByWorkspaceId(workspaceId);
        BigDecimal lostTotal = dealRepository.sumLostValueByWorkspaceId(workspaceId);
        long totalDeals      = dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId);

        List<PipelineStageSummaryDto> stages =
                dealRepository.findPipelineSummaryByWorkspaceId(workspaceId);

        return new PipelineSummaryDto(total, wonTotal, lostTotal, totalDeals, stages);
    }
}
