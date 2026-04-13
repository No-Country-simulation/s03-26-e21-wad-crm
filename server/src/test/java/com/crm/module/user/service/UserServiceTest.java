package com.crm.module.user.service;

import com.crm.common.exception.AuthenticationException;
import com.crm.common.exception.ConflictException;
import com.crm.common.exception.ForbiddenException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.module.user.dto.ChangePasswordRequest;
import com.crm.module.user.dto.InviteUserRequest;
import com.crm.module.user.dto.UpdateRoleRequest;
import com.crm.module.user.dto.UserDto;
import com.crm.module.user.entity.User;
import com.crm.module.user.entity.UserRole;
import com.crm.module.user.entity.Role;
import com.crm.module.user.repository.RoleRepository;
import com.crm.module.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserService}.
 *
 * Validates: Requirements 6.6, 32.3, 34.2
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UUID workspaceId;
    private UUID userId;
    private User activeAdmin;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        userId = UUID.randomUUID();

        activeAdmin = User.builder()
                .email("admin@example.com")
                .name("Admin User")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();
        activeAdmin.setId(userId);
        activeAdmin.setWorkspaceId(workspaceId);
    }

    // -------------------------------------------------------------------------
    // inviteUser – Req 6.2
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("inviteUser: crea usuario con isActive=false y rol SALES por defecto")
    void inviteUser_happyPath_createsInactiveUser() {
        // Arrange
        InviteUserRequest request = new InviteUserRequest("new@example.com", "New User", null);

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        // Act
        UserDto result = userService.inviteUser(workspaceId, request);

        // Assert
        assertThat(result.getEmail()).isEqualTo("new@example.com");
        assertThat(result.isActive()).isFalse();
        assertThat(result.getRole()).isEqualTo(UserRole.SALES);
        assertThat(result.getWorkspaceId()).isEqualTo(workspaceId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    @Test
    @DisplayName("inviteUser: email duplicado lanza ConflictException")
    void inviteUser_duplicateEmail_throwsConflictException() {
        InviteUserRequest request = new InviteUserRequest("existing@example.com", "User", null);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.inviteUser(workspaceId, request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("existing@example.com");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("inviteUser: rol explícito es respetado")
    void inviteUser_withExplicitRole_usesProvidedRole() {
        InviteUserRequest request = new InviteUserRequest("manager@example.com", "Manager", UserRole.MANAGER);

        when(userRepository.existsByEmail("manager@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        UserDto result = userService.inviteUser(workspaceId, request);

        assertThat(result.getRole()).isEqualTo(UserRole.MANAGER);
    }

    // -------------------------------------------------------------------------
    // updateRole – Req 6.3 / 34.2
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("updateRole: cambia rol de SALES a MANAGER exitosamente")
    void updateRole_happyPath_updatesRole() {
        // Arrange
        User salesUser = User.builder()
                .email("sales@example.com")
                .name("Sales User")
                .role(UserRole.SALES)
                .isActive(true)
                .build();
        salesUser.setId(UUID.randomUUID());
        salesUser.setWorkspaceId(workspaceId);

        UpdateRoleRequest request = new UpdateRoleRequest(UserRole.MANAGER);

        when(userRepository.findById(salesUser.getId())).thenReturn(Optional.of(salesUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        UserDto result = userService.updateRole(workspaceId, salesUser.getId(), request);

        // Assert
        assertThat(result.getRole()).isEqualTo(UserRole.MANAGER);
        verify(userRepository).save(salesUser);
    }

    /**
     * Req 6.6 / 34.2: no se puede degradar al último ADMIN activo.
     */
    @Test
    @DisplayName("updateRole: degradar último ADMIN lanza ForbiddenException (Req 6.6, 34.2)")
    void updateRole_demoteLastAdmin_throwsForbiddenException() {
        // Arrange
        UpdateRoleRequest request = new UpdateRoleRequest(UserRole.SALES);

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByWorkspaceIdAndRoleAndIsActiveTrue(workspaceId, UserRole.ADMIN))
                .thenReturn(1L);

        // Act & Assert
        assertThatThrownBy(() -> userService.updateRole(workspaceId, userId, request))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("ADMIN");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateRole: degradar ADMIN cuando hay otro ADMIN activo es permitido")
    void updateRole_demoteAdminWhenAnotherExists_succeeds() {
        UpdateRoleRequest request = new UpdateRoleRequest(UserRole.MANAGER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByWorkspaceIdAndRoleAndIsActiveTrue(workspaceId, UserRole.ADMIN))
                .thenReturn(2L);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDto result = userService.updateRole(workspaceId, userId, request);

        assertThat(result.getRole()).isEqualTo(UserRole.MANAGER);
    }

    // -------------------------------------------------------------------------
    // deactivate – Req 6.4 / 6.6
    // -------------------------------------------------------------------------

    /**
     * Req 6.6: intentar eliminar el último ADMIN debe lanzar ForbiddenException.
     */
    @Test
    @DisplayName("deactivate: eliminar último ADMIN lanza ForbiddenException (Req 6.6)")
    void deactivate_lastAdmin_throwsForbiddenException() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(activeAdmin));
        when(userRepository.countByWorkspaceIdAndRoleAndIsActiveTrue(workspaceId, UserRole.ADMIN))
                .thenReturn(1L);

        // Act & Assert
        assertThatThrownBy(() -> userService.deactivate(workspaceId, userId))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("ADMIN");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("deactivate: desactiva usuario no-ADMIN exitosamente (soft delete)")
    void deactivate_nonAdminUser_setsActiveToFalse() {
        User salesUser = User.builder()
                .email("sales@example.com")
                .name("Sales User")
                .role(UserRole.SALES)
                .isActive(true)
                .build();
        UUID salesId = UUID.randomUUID();
        salesUser.setId(salesId);
        salesUser.setWorkspaceId(workspaceId);

        when(userRepository.findById(salesId)).thenReturn(Optional.of(salesUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.deactivate(workspaceId, salesId);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
    }

    // -------------------------------------------------------------------------
    // changePassword – Req 32.3 / 34.2
    // -------------------------------------------------------------------------

    /**
     * Req 32.3 / 34.2: contraseña actual incorrecta → AuthenticationException.
     */
    @Test
    @DisplayName("changePassword: contraseña actual incorrecta lanza AuthenticationException (Req 32.3, 34.2)")
    void changePassword_wrongCurrentPassword_throwsAuthenticationException() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest("wrongPassword", "newSecurePass1");

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeAdmin));
        when(passwordEncoder.matches("wrongPassword", activeAdmin.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> userService.changePassword(userId, request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("incorrect");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword: contraseña correcta actualiza el hash")
    void changePassword_correctCurrentPassword_updatesHash() {
        // Arrange
        activeAdmin.setPasswordHash("$2a$10$oldhash");
        ChangePasswordRequest request = new ChangePasswordRequest("correctPassword", "newSecurePass1");

        when(userRepository.findById(userId)).thenReturn(Optional.of(activeAdmin));
        when(passwordEncoder.matches("correctPassword", "$2a$10$oldhash")).thenReturn(true);
        when(passwordEncoder.encode("newSecurePass1")).thenReturn("$2a$10$newhash");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        userService.changePassword(userId, request);

        // Assert
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("$2a$10$newhash");
    }

    @Test
    @DisplayName("changePassword: usuario no encontrado lanza ResourceNotFoundException")
    void changePassword_userNotFound_throwsResourceNotFoundException() {
        ChangePasswordRequest request = new ChangePasswordRequest("any", "newSecurePass1");
        UUID unknownId = UUID.randomUUID();

        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.changePassword(unknownId, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
