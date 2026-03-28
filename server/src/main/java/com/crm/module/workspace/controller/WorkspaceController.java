package com.crm.module.workspace.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.workspace.dto.UpdateWorkspaceRequest;
import com.crm.module.workspace.dto.WorkspaceDto;
import com.crm.module.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Workspace settings endpoints.
 * Satisfies: Requirements 33.1–33.3
 */
@RestController
@RequestMapping("/api/settings/workspace")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    // -------------------------------------------------------------------------
    // Req 33.1 – get workspace configuration (ADMIN only)
    // -------------------------------------------------------------------------

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkspaceDto> getWorkspace() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId));
    }

    // -------------------------------------------------------------------------
    // Req 33.2 – update workspace configuration (ADMIN only)
    // -------------------------------------------------------------------------

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WorkspaceDto> updateWorkspace(
            @Valid @RequestBody UpdateWorkspaceRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request));
    }
}
