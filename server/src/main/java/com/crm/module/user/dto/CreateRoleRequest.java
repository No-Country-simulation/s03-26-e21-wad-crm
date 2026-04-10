package com.crm.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new Role
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    private String name;

    private String description;

    /**
     * Comma-separated list of permissions
     * Examples: "send-message,read-conversations", "manage-config"
     */
    @NotNull(message = "Permissions are required")
    private String permissions;
}
