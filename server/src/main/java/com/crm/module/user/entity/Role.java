package com.crm.module.user.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Role entity for flexible RBAC management
 * Represents a role with specific permissions within a workspace
 */
@Entity
@Table(name = "roles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workspace_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends AuditableEntity {

    @Column(name = "workspace_id", nullable = false)
    private java.util.UUID workspaceId;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    /**
     * Comma-separated list of permissions (e.g., "send-message,read-conversations,manage-config")
     */
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean isSystem = false;  // System roles (ADMIN, AGENT, USER, VIEWER) cannot be deleted

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
