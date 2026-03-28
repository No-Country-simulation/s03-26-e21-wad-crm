package com.crm.module.workspace.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.module.workspace.dto.UpdateWorkspaceRequest;
import com.crm.module.workspace.dto.WorkspaceDto;
import com.crm.module.workspace.entity.Workspace;
import com.crm.module.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Manages workspace configuration retrieval and updates.
 * Satisfies: Requirements 33.1–33.2
 */
@Service
@Transactional
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;

    // -------------------------------------------------------------------------
    // Req 33.1 – get workspace settings
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public WorkspaceDto getWorkspace(UUID workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));
        return WorkspaceDto.from(workspace);
    }

    // -------------------------------------------------------------------------
    // Req 33.2 – update workspace settings
    // -------------------------------------------------------------------------

    public WorkspaceDto updateWorkspace(UUID workspaceId, UpdateWorkspaceRequest request) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", workspaceId));

        if (request.getName() != null && !request.getName().isBlank()) {
            workspace.setName(request.getName());
        }
        if (request.getTimezone() != null) {
            workspace.setTimezone(request.getTimezone());
        }

        return WorkspaceDto.from(workspaceRepository.save(workspace));
    }
}
