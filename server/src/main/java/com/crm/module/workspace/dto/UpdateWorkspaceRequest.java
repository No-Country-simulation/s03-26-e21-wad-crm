package com.crm.module.workspace.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for PATCH /api/settings/workspace.
 * All fields are optional; only non-null values are applied.
 * Satisfies: Requirement 33.2
 */
@Data
public class UpdateWorkspaceRequest {

    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    private String name;

    @Size(max = 50, message = "Timezone must be at most 50 characters")
    private String timezone;
}
