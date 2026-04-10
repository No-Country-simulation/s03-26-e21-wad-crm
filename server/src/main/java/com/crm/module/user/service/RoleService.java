package com.crm.module.user.service;

import com.crm.module.user.dto.CreateRoleRequest;
import com.crm.module.user.dto.RoleDto;
import com.crm.module.user.dto.UpdateRolePermissionsRequest;
import com.crm.module.user.entity.Role;
import com.crm.module.user.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing roles and permissions
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    /**
     * Initialize system roles (ADMIN, AGENT, USER, VIEWER) for a workspace
     */
    public void initializeSystemRoles(UUID workspaceId) {
        // Check if system roles already exist
        if (roleRepository.findByWorkspaceIdAndNameAndIsActiveTrue(workspaceId, "ADMIN").isPresent()) {
            return; // Already initialized
        }

        // ADMIN: Full access
        roleRepository.save(Role.builder()
            .workspaceId(workspaceId)
            .name("ADMIN")
            .description("Full access to all features")
            .permissions("send-message,read-conversations,manage-config,manage-templates,manage-crm,view-logs,manage-roles")
            .isSystem(true)
            .isActive(true)
            .build());

        // AGENT: Can send messages and read conversations
        roleRepository.save(Role.builder()
            .workspaceId(workspaceId)
            .name("AGENT")
            .description("Can send messages and manage conversations")
            .permissions("send-message,read-conversations")
            .isSystem(true)
            .isActive(true)
            .build());

        // USER: Can read conversations only
        roleRepository.save(Role.builder()
            .workspaceId(workspaceId)
            .name("USER")
            .description("Can read conversations")
            .permissions("read-conversations")
            .isSystem(true)
            .isActive(true)
            .build());

        // VIEWER: Read-only access
        roleRepository.save(Role.builder()
            .workspaceId(workspaceId)
            .name("VIEWER")
            .description("Read-only access")
            .permissions("read-conversations-readonly")
            .isSystem(true)
            .isActive(true)
            .build());

        log.info("System roles initialized for workspace: {}", workspaceId);
    }

    /**
     * Get all active roles in a workspace
     */
    public List<RoleDto> listRolesByWorkspace(UUID workspaceId) {
        return roleRepository
            .findByWorkspaceIdAndIsActiveTrue(workspaceId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get a specific role
     */
    public RoleDto getRoleById(UUID roleId, UUID workspaceId) {
        Role role = roleRepository
            .findByIdAndWorkspaceId(roleId, workspaceId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found"));
        return mapToDto(role);
    }

    /**
     * Get role by name (used in AuthService)
     */
    public Role getRoleByName(UUID workspaceId, String roleName) {
        return roleRepository
            .findByWorkspaceIdAndNameAndIsActiveTrue(workspaceId, roleName)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));
    }

    /**
     * Create a new custom role
     */
    public RoleDto createRole(UUID workspaceId, CreateRoleRequest request) {
        // Validate role name doesn't already exist
        if (roleRepository.findByWorkspaceIdAndNameAndIsActiveTrue(workspaceId, request.getName()).isPresent()) {
            throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
        }

        Role role = Role.builder()
            .workspaceId(workspaceId)
            .name(request.getName())
            .description(request.getDescription())
            .permissions(request.getPermissions())
            .isSystem(false)
            .isActive(true)
            .build();

        Role saved = roleRepository.save(role);
        log.info("Role created: {} in workspace: {}", request.getName(), workspaceId);
        return mapToDto(saved);
    }

    /**
     * Update role permissions
     * System roles cannot be deleted but can be updated
     */
    public RoleDto updateRolePermissions(UUID roleId, UUID workspaceId, UpdateRolePermissionsRequest request) {
        Role role = roleRepository
            .findByIdAndWorkspaceId(roleId, workspaceId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        role.setPermissions(request.getPermissions());
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        Role updated = roleRepository.save(role);
        log.info("Role permissions updated: {} in workspace: {}", role.getName(), workspaceId);
        return mapToDto(updated);
    }

    /**
     * Deactivate a role (soft delete)
     * System roles cannot be deleted
     */
    public void deactivateRole(UUID roleId, UUID workspaceId) {
        Role role = roleRepository
            .findByIdAndWorkspaceId(roleId, workspaceId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        if (role.isSystem()) {
            throw new IllegalArgumentException("System roles cannot be deleted");
        }

        role.setActive(false);
        roleRepository.save(role);
        log.info("Role deactivated: {} in workspace: {}", role.getName(), workspaceId);
    }

    /**
     * Check if user has a specific permission
     */
    public boolean hasPermission(UUID roleId, UUID workspaceId, String permission) {
        Role role = roleRepository
            .findByIdAndWorkspaceId(roleId, workspaceId)
            .orElse(null);

        if (role == null) {
            return false;
        }

        String[] permissions = role.getPermissions().split(",");
        for (String p : permissions) {
            if (p.trim().equals(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Map Role entity to DTO
     */
    private RoleDto mapToDto(Role role) {
        return RoleDto.builder()
            .id(role.getId())
            .name(role.getName())
            .description(role.getDescription())
            .permissions(role.getPermissions())
            .isSystem(role.isSystem())
            .isActive(role.isActive())
            .build();
    }
}
