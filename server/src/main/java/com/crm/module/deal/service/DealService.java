package com.crm.module.deal.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.dto.*;
import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.entity.DealStageHistory;
import com.crm.module.deal.entity.Stage;
import com.crm.module.deal.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final StageRepository stageRepository;
    private final PipelineRepository pipelineRepository;
    private final DealStageHistoryRepository historyRepository;
    private final ContactRepository contactRepository;

    // -------------------------------------------------------------------------
    // Create — Req 14.1–14.5
    // -------------------------------------------------------------------------

    @Transactional
    public DealResponse create(CreateDealRequest request, UUID createdByUserId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        // Validate contact belongs to workspace (Req 14.2)
        contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, request.contactId())
                .orElseThrow(() -> new ResourceNotFoundException("Contact", request.contactId()));

        // Resolve stage: use provided or fall back to first stage of default pipeline (Req 14.4)
        Stage stage = resolveStage(request.stageId(), workspaceId);

        Deal deal = Deal.builder()
                .name(request.name())
                .value(request.value())
                .contactId(request.contactId())
                .assignedTo(request.assignedTo() != null ? request.assignedTo() : createdByUserId)
                .stage(stage)
                .build();
        deal.setWorkspaceId(workspaceId);

        return toResponse(dealRepository.save(deal));
    }

    // -------------------------------------------------------------------------
    // Update — Req 16.1–16.4
    // -------------------------------------------------------------------------

    @Transactional
    public DealResponse update(UUID id, UpdateDealRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        Deal deal = dealRepository.findByIdAndWorkspaceIdAndDeletedFalse(id, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", id));

        if (request.name() != null) deal.setName(request.name());
        if (request.value() != null) deal.setValue(request.value());
        if (request.assignedTo() != null) deal.setAssignedTo(request.assignedTo());

        if (request.contactId() != null) {
            contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, request.contactId())
                    .orElseThrow(() -> new ResourceNotFoundException("Contact", request.contactId()));
            deal.setContactId(request.contactId());
        }

        return toResponse(dealRepository.save(deal));
    }

    // -------------------------------------------------------------------------
    // Move stage — Req 15.1–15.4
    // -------------------------------------------------------------------------

    @Transactional
    public DealResponse moveStage(UUID id, UUID newStageId, UUID movedByUserId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        Deal deal = dealRepository.findByIdAndWorkspaceIdAndDeletedFalse(id, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", id));

        // Validate stage belongs to same workspace (Req 15.2)
        Stage newStage = stageRepository.findByIdAndWorkspaceId(newStageId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Stage " + newStageId + " does not belong to this workspace"));

        UUID fromStageId = deal.getStage() != null ? deal.getStage().getId() : null;

        deal.setStage(newStage);
        dealRepository.save(deal);

        // Record history (Req 15.4)
        DealStageHistory history = DealStageHistory.builder()
                .dealId(id)
                .fromStageId(fromStageId)
                .toStageId(newStageId)
                .changedBy(movedByUserId)
                .build();
        historyRepository.save(history);

        return toResponse(deal);
    }

    // -------------------------------------------------------------------------
    // List — Req 17.1, 17.4
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<DealResponse> list(UUID stageId, UUID assignedTo, UUID contactId, Pageable pageable) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return dealRepository
                .findAll(DealSpecification.withFilters(workspaceId, stageId, assignedTo, contactId), pageable)
                .map(this::toResponse);
    }

    // -------------------------------------------------------------------------
    // Pipeline summary — Req 17.2, 18.1–18.4
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Stage resolveStage(UUID stageId, UUID workspaceId) {
        if (stageId != null) {
            return stageRepository.findByIdAndWorkspaceId(stageId, workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Stage", stageId));
        }
        // Fall back to first stage of the default pipeline (Req 14.4)
        return pipelineRepository.findByWorkspaceIdAndIsDefaultTrue(workspaceId)
                .flatMap(p -> stageRepository.findFirstByPipelineIdAndWorkspaceIdOrderByOrderAsc(
                        p.getId(), workspaceId))
                .orElseThrow(() -> new IllegalStateException(
                        "No default pipeline or stages configured for this workspace"));
    }

    private DealResponse toResponse(Deal d) {
        DealResponse.StageInfo stageInfo = d.getStage() != null
                ? new DealResponse.StageInfo(
                        d.getStage().getId(),
                        d.getStage().getName(),
                        d.getStage().isWon(),
                        d.getStage().isLost())
                : null;

        return new DealResponse(
                d.getId(),
                d.getName(),
                d.getValue(),
                d.getContactId(),
                d.getAssignedTo(),
                d.getWorkspaceId(),
                stageInfo,
                d.isDeleted(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }
}
