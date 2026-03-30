package com.crm.module.user.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.user.dto.*;
import com.crm.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * User management endpoints.
 *
 * Satisfies: Requirements 6.1–6.5, 32.1–32.4
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // -------------------------------------------------------------------------
    // Req 6.1 – list users in workspace (ADMIN only)
    // -------------------------------------------------------------------------

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> listUsers() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(userService.listByWorkspace(workspaceId));
    }

    // -------------------------------------------------------------------------
    // Req 6.2 – invite user (ADMIN only)
    // -------------------------------------------------------------------------

    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> inviteUser(@Valid @RequestBody InviteUserRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        UserDto created = userService.inviteUser(workspaceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // -------------------------------------------------------------------------
    // Req 6.3 – update role (ADMIN only)
    // -------------------------------------------------------------------------

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoleRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        UserDto updated = userService.updateRole(workspaceId, id, request);
        return ResponseEntity.ok(updated);
    }

    // -------------------------------------------------------------------------
    // Req 6.4 – deactivate user / soft delete (ADMIN only)
    // -------------------------------------------------------------------------

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        userService.deactivate(workspaceId, id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Req 32.0 – get own profile
    // -------------------------------------------------------------------------

    @GetMapping("/me")
    public ResponseEntity<UserDto> getProfile(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    // -------------------------------------------------------------------------
    // Req 32.1 – update own profile
    // -------------------------------------------------------------------------

    @PatchMapping("/me")
    public ResponseEntity<UserDto> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        UserDto updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(updated);
    }

    // -------------------------------------------------------------------------
    // Req 32.2–32.4 – change own password
    // -------------------------------------------------------------------------

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        UUID userId = (UUID) authentication.getPrincipal();
        userService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }
}
