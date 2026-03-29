package com.crm.module.deal.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.deal.dto.*;
import com.crm.module.deal.service.DealService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Deal and pipeline endpoints.
 * Requisitos: 14.1, 15.1, 16.1, 17.1, 18.1
 */
@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    // -------------------------------------------------------------------------
    // POST /api/deals — Req 14.1
    // -------------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<DealResponse> create(
            @Valid @RequestBody CreateDealRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        DealResponse created = dealService.create(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // -------------------------------------------------------------------------
    // GET /api/deals — Req 17.1
    // -------------------------------------------------------------------------

    @GetMapping
    public ResponseEntity<Page<DealResponse>> list(
            @RequestParam(required = false) UUID stageId,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(required = false) UUID contactId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(dealService.list(stageId, assignedTo, contactId, pageable));
    }

    // -------------------------------------------------------------------------
    // PATCH /api/deals/{id} — Req 16.1
    // -------------------------------------------------------------------------

    @PatchMapping("/{id}")
    public ResponseEntity<DealResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDealRequest request) {
        return ResponseEntity.ok(dealService.update(id, request));
    }

    // -------------------------------------------------------------------------
    // PATCH /api/deals/{id}/stage — Req 15.1
    // -------------------------------------------------------------------------

    @PatchMapping("/{id}/stage")
    public ResponseEntity<DealResponse> moveStage(
            @PathVariable UUID id,
            @Valid @RequestBody MoveStageRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(dealService.moveStage(id, request.stageId(), userId));
    }

    // -------------------------------------------------------------------------
    // GET /api/deals/pipeline/summary — Req 18.1 (ADMIN/MANAGER only)
    // -------------------------------------------------------------------------

    @GetMapping("/pipeline/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PipelineSummaryDto> getPipelineSummary() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(dealService.getPipelineSummary(workspaceId));
    }
}
