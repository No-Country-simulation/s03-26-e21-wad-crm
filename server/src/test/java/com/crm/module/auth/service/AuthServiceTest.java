package com.crm.module.auth.service;

import com.crm.common.exception.AuthenticationException;
import com.crm.common.exception.ConflictException;
import com.crm.common.security.JwtService;
import com.crm.module.auth.dto.LoginRequest;
import com.crm.module.auth.dto.RegisterRequest;
import com.crm.module.auth.dto.TokenResponse;
import com.crm.module.auth.entity.RefreshToken;
import com.crm.module.auth.repository.RefreshTokenRepository;
import com.crm.module.user.entity.User;
import com.crm.module.user.entity.UserRole;
import com.crm.module.user.repository.UserRepository;
import com.crm.module.workspace.entity.Workspace;
import com.crm.module.workspace.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AuthService}.
 *
 * Validates: Requirements 1.2, 1.3, 2.2, 4.2, 5.2
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private WorkspaceRepository workspaceRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private UUID userId;
    private UUID workspaceId;
    private User user;
    private Workspace workspace;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        workspaceId = UUID.randomUUID();

        workspace = Workspace.builder()
                .id(workspaceId)
                .name("Test Workspace")
                .build();

        user = User.builder()
                .email("user@example.com")
                .passwordHash("$2a$10$hashedpassword")
                .name("Test User")
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();
        user.setId(userId);
        user.setWorkspaceId(workspaceId);
    }

    // -------------------------------------------------------------------------
    // Register
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("register: registro exitoso crea workspace, usuario y retorna tokens")
    void register_success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("securePass1");
        request.setName("New User");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(workspaceRepository.save(any(Workspace.class))).thenReturn(workspace);
        when(passwordEncoder.encode("securePass1")).thenReturn("$2a$10$encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtService.generateAccessToken(any(), any(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken()).thenReturn("raw-refresh-token");
        when(jwtService.getRefreshTokenExpiry()).thenReturn(604_800_000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        TokenResponse response = authService.register(request);

        // Assert
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("raw-refresh-token");
        verify(workspaceRepository).save(any(Workspace.class));
        verify(userRepository).save(any(User.class));
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    /**
     * Req 1.2: email duplicado → ConflictException
     */
    @Test
    @DisplayName("register: email duplicado lanza ConflictException (Req 1.2)")
    void register_duplicateEmail_throwsConflictException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@example.com");
        request.setPassword("securePass1");
        request.setName("User");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("existing@example.com");

        verify(workspaceRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    /**
     * Req 2.2: credenciales inválidas → AuthenticationException
     */
    @Test
    @DisplayName("login: usuario no encontrado lanza AuthenticationException (Req 2.2)")
    void login_userNotFound_throwsAuthenticationException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("ghost@example.com");
        request.setPassword("anyPassword");

        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessage("Invalid credentials");
    }

    /**
     * Req 2.2: password incorrecta → AuthenticationException con mensaje genérico
     */
    @Test
    @DisplayName("login: password incorrecta lanza AuthenticationException con mensaje genérico (Req 2.2)")
    void login_wrongPassword_throwsAuthenticationException() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("wrongPassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", user.getPasswordHash())).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AuthenticationException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("login: credenciales válidas retorna tokens y revoca tokens anteriores")
    void login_validCredentials_returnsTokensAndRevokesOld() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("correctPassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctPassword", user.getPasswordHash())).thenReturn(true);
        when(jwtService.generateAccessToken(any(), any(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken()).thenReturn("raw-refresh-token");
        when(jwtService.getRefreshTokenExpiry()).thenReturn(604_800_000L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        TokenResponse response = authService.login(request);

        // Assert
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        verify(refreshTokenRepository).revokeAllByUserId(userId);
    }

    // -------------------------------------------------------------------------
    // Refresh
    // -------------------------------------------------------------------------

    /**
     * Req 4.2 / 5.2: refresh token revocado → AuthenticationException
     */
    @Test
    @DisplayName("refresh: token revocado lanza AuthenticationException (Req 4.2, 5.2)")
    void refresh_revokedToken_throwsAuthenticationException() {
        // Arrange
        String rawToken = "some-raw-refresh-token";
        RefreshToken revokedToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .tokenHash("irrelevant-hash")
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revokedAt(LocalDateTime.now().minusHours(1))  // already revoked
                .build();

        // We need to match the SHA-256 hash that AuthService computes internally.
        // Since we can't easily predict the hash, we stub findByTokenHash with any string.
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(revokedToken));

        // Act & Assert
        assertThatThrownBy(() -> authService.refresh(rawToken))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("revoked");
    }

    /**
     * Req 4.2: refresh token no encontrado → AuthenticationException
     */
    @Test
    @DisplayName("refresh: token no encontrado lanza AuthenticationException (Req 4.2)")
    void refresh_tokenNotFound_throwsAuthenticationException() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.refresh("unknown-token"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessage("Invalid refresh token");
    }

    /**
     * Req 4.2: refresh token expirado → AuthenticationException
     */
    @Test
    @DisplayName("refresh: token expirado lanza AuthenticationException (Req 4.2)")
    void refresh_expiredToken_throwsAuthenticationException() {
        RefreshToken expiredToken = RefreshToken.builder()
                .id(UUID.randomUUID())
                .tokenHash("hash")
                .userId(userId)
                .expiresAt(LocalDateTime.now().minusDays(1))  // expired
                .revokedAt(null)
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refresh("expired-token"))
                .isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("expired");
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("logout: idempotente — múltiples llamadas no lanzan excepción")
    void logout_idempotent_noExceptionOnMultipleCalls() {
        // revokeAllByUserId is a void method — calling it multiple times is safe
        doNothing().when(refreshTokenRepository).revokeAllByUserId(userId);

        // Act — call twice to verify idempotency
        assertThatCode(() -> {
            authService.logout(userId);
            authService.logout(userId);
        }).doesNotThrowAnyException();

        verify(refreshTokenRepository, times(2)).revokeAllByUserId(userId);
    }

    @Test
    @DisplayName("logout: invoca revokeAllByUserId con el userId correcto")
    void logout_revokesAllTokensForUser() {
        doNothing().when(refreshTokenRepository).revokeAllByUserId(userId);

        authService.logout(userId);

        ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
        verify(refreshTokenRepository).revokeAllByUserId(captor.capture());
        assertThat(captor.getValue()).isEqualTo(userId);
    }
}
