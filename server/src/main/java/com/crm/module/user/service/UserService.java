package com.crm.module.user.service;

import com.crm.common.exception.ConflictException;
import com.crm.common.exception.ForbiddenException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.module.user.dto.*;
import com.crm.module.user.entity.User;
import com.crm.module.user.entity.UserRole;
import com.crm.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Manages workspace users: listing, inviting, role changes, deactivation,
 * profile updates and password changes.
 *
 * Satisfies: Requirements 6.1–6.6, 32.1–32.4, 34.1–34.3
 */
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // -------------------------------------------------------------------------
    // Req 6.1 – list active users in workspace
    // -------------------------------------------------------------------------

    /**
     * Returns all active users belonging to the given workspace.
     */
    @Transactional(readOnly = true)
    public List<UserDto> listByWorkspace(UUID workspaceId) {
        return userRepository.findByWorkspaceId(workspaceId).stream()
                .filter(User::isActive)
                .map(UserDto::from)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Req 6.2 – invite user (creates inactive user)
    // -------------------------------------------------------------------------

    /**
     * Creates a new user in the workspace with {@code isActive=false} (pending invite).
     * Defaults role to SALES when not specified.
     * Throws {@link ConflictException} if the email is already registered.
     */
    public UserDto inviteUser(UUID workspaceId, InviteUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.SALES;

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .role(role)
                .isActive(false)
                .build();
        user.setWorkspaceId(workspaceId);

        return UserDto.from(userRepository.save(user));
    }

    // -------------------------------------------------------------------------
    // Req 6.3 / 34.2 – update role, protect last ADMIN
    // -------------------------------------------------------------------------

    /**
     * Updates the role of a user within the workspace.
     * Throws {@link ForbiddenException} if the change would remove the last active ADMIN.
     */
    public UserDto updateRole(UUID workspaceId, UUID userId, UpdateRoleRequest request) {
        User user = findActiveInWorkspace(workspaceId, userId);

        boolean demotingAdmin = user.getRole() == UserRole.ADMIN
                && request.getRole() != UserRole.ADMIN;

        if (demotingAdmin) {
            long activeAdmins = userRepository
                    .countByWorkspaceIdAndRoleAndIsActiveTrue(workspaceId, UserRole.ADMIN);
            if (activeAdmins <= 1) {
                throw new ForbiddenException(
                        "Cannot change role: workspace must have at least one active ADMIN");
            }
        }

        user.setRole(request.getRole());
        return UserDto.from(userRepository.save(user));
    }

    // -------------------------------------------------------------------------
    // Req 6.4 / 34.1 / 34.3 – deactivate (soft delete), protect last ADMIN
    // -------------------------------------------------------------------------

    /**
     * Soft-deletes a user by setting {@code isActive=false}.
     * Throws {@link ForbiddenException} if the user is the last active ADMIN.
     */
    public void deactivate(UUID workspaceId, UUID userId) {
        User user = findActiveInWorkspace(workspaceId, userId);

        if (user.getRole() == UserRole.ADMIN) {
            long activeAdmins = userRepository
                    .countByWorkspaceIdAndRoleAndIsActiveTrue(workspaceId, UserRole.ADMIN);
            if (activeAdmins <= 1) {
                throw new ForbiddenException(
                        "Cannot deactivate: workspace must have at least one active ADMIN");
            }
        }

        user.setActive(false);
        userRepository.save(user);
    }

    // -------------------------------------------------------------------------
    // Req 32.0 – get own profile
    // -------------------------------------------------------------------------

    /**
     * Returns the profile of the authenticated user.
     */
    public UserDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserDto.from(user);
    }

    // -------------------------------------------------------------------------
    // Req 32.1 – update own profile
    // -------------------------------------------------------------------------

    /**
     * Updates name, phone and timezone for the authenticated user.
     */
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }

        return UserDto.from(userRepository.save(user));
    }

    // -------------------------------------------------------------------------
    // Req 32.2–32.4 – change password
    // -------------------------------------------------------------------------

    /**
     * Changes the user's password after verifying the current one.
     * Throws {@link com.crm.common.exception.AuthenticationException} (mapped to HTTP 400)
     * if the current password is wrong, or if the new password is too short (validated
     * via {@link ChangePasswordRequest} constraint).
     */
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new com.crm.common.exception.AuthenticationException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User findActiveInWorkspace(UUID workspaceId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!workspaceId.equals(user.getWorkspaceId())) {
            throw new ResourceNotFoundException("User", userId);
        }

        if (!user.isActive()) {
            throw new ResourceNotFoundException("User", userId);
        }

        return user;
    }
}
