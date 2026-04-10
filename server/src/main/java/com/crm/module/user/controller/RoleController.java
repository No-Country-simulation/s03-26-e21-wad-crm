package com.crm.module.user.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.user.dto.CreateRoleRequest;
import com.crm.module.user.dto.RoleDto;
import com.crm.module.user.dto.UpdateRolePermissionsRequest;
import com.crm.module.user.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Role management endpoints (ADMIN only)
 */
@Slf4j
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    /**
     * GET /api/roles - List all active roles in workspace
     * ADMIN only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleDto>> listRoles() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        List<RoleDto> roles = roleService.listRolesByWorkspace(workspaceId);
        return ResponseEntity.ok(roles);
    }

    /**
     * GET /api/roles/:id - Get a specific role
     * ADMIN only
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDto> getRoleById(@PathVariable UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        RoleDto role = roleService.getRoleById(id, workspaceId);
        return ResponseEntity.ok(role);
    }

    /**
     * POST /api/roles - Create a new custom role
     * ADMIN only
     * Cannot create system roles (ADMIN, AGENT, USER, VIEWER)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDto> createRole(@Valid @RequestBody CreateRoleRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        RoleDto created = roleService.createRole(workspaceId, request);
        log.info("Role created by ADMIN: {}", created.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/roles/:id - Update role permissions
     * ADMIN only
     * System roles can be updated but not deleted
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDto> updateRolePermissions(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRolePermissionsRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        RoleDto updated = roleService.updateRolePermissions(id, workspaceId, request);
        log.info("Role permissions updated: {}", id);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/roles/:id - Deactivate a role (soft delete)
     * ADMIN only
     * Cannot delete system roles
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        roleService.deactivateRole(id, workspaceId);
        log.info("Role deactivated: {}", id);
        return ResponseEntity.noContent().build();
    }
}
