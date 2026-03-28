package com.crm.module.workspace.dto;

import com.crm.module.workspace.entity.Workspace;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for workspace settings.
 * Satisfies: Requirements 33.1, 33.2
 */
@Value
@Builder
public class WorkspaceDto {

    UUID id;
    String name;
    String timezone;
    String plan;
    LocalDateTime createdAt;

    public static WorkspaceDto from(Workspace workspace) {
        return WorkspaceDto.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .timezone(workspace.getTimezone())
                .plan(workspace.getPlan())
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}
