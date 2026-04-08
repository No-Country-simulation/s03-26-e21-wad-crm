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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Handles registration, login, token refresh, and logout.
 *
 * Satisfies: Requirements 1.1–1.6, 2.1–2.5, 4.1–4.4, 5.1–5.3
 */
@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    // -------------------------------------------------------------------------
    // Register
    // -------------------------------------------------------------------------

    /**
     * Creates a new Workspace + ADMIN User in a single transaction.
     * Throws {@link ConflictException} if the email is already registered.
     */
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        // Create workspace - use companyName if provided, otherwise use user's name
        String workspaceName = request.getCompanyName() != null && !request.getCompanyName().isBlank()
                ? request.getCompanyName()
                : request.getName() + "'s Workspace";
        String slug = workspaceName.toLowerCase().replaceAll("[^a-z0-9]", "-") + "-" + UUID.randomUUID().toString().substring(0, 8);
        Workspace workspace = workspaceRepository.save(
                Workspace.builder()
                        .name(workspaceName)
                        .slug(slug)
                        .plan("FREE")
                        .timezone("UTC")
                        .build()
        );

        // Create admin user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(UserRole.ADMIN)
                .isActive(true)
                .timezone("UTC")
                .build();
        user.setWorkspaceId(workspace.getId());

        user = userRepository.save(user);

        return buildTokenResponse(user, workspace.getId());
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    /**
     * Authenticates a user by email/password.
     * Revokes all existing refresh tokens and issues a fresh pair.
     * Throws {@link AuthenticationException} if credentials are invalid.
     */
    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid credentials");
        }

        // Revoke all previous refresh tokens for this user
        refreshTokenRepository.revokeAllByUserId(user.getId());

        return buildTokenResponse(user, user.getWorkspaceId());
    }

    // -------------------------------------------------------------------------
    // Refresh
    // -------------------------------------------------------------------------

    /**
     * Rotates the refresh token: revokes the old one and issues a new pair.
     * Throws {@link AuthenticationException} if the token is not found, revoked, or expired.
     */
    public TokenResponse refresh(String rawRefreshToken) {
        String tokenHash = sha256(rawRefreshToken);

        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token"));

        if (stored.getRevokedAt() != null) {
            throw new AuthenticationException("Refresh token has been revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Refresh token has expired");
        }

        // Revoke old token
        stored.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(stored);

        // Load user to get current role / workspaceId
        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new AuthenticationException("User not found"));

        return buildTokenResponse(user, user.getWorkspaceId());
    }

    // -------------------------------------------------------------------------
    // Google OAuth helpers
    // -------------------------------------------------------------------------

    /**
     * Finds the user by email and issues a fresh token pair.
     * Throws {@link AuthenticationException} if no user with that email exists.
     */
    public TokenResponse loginWithGoogle(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("User not found: " + email));

        refreshTokenRepository.revokeAllByUserId(user.getId());

        return buildTokenResponse(user, user.getWorkspaceId());
    }

    /**
     * Creates a new Workspace + ADMIN User (no passwordHash) in a single transaction.
     * Used when a Google email is new to the system.
     */
    public TokenResponse registerWithGoogle(String email, String name) {
        Workspace workspace = workspaceRepository.save(
                Workspace.builder()
                        .name(name + "'s Workspace")
                        .build()
        );

        User user = User.builder()
                .email(email)
                .name(name)
                .role(UserRole.ADMIN)
                .isActive(true)
                .build();
        user.setWorkspaceId(workspace.getId());

        user = userRepository.save(user);

        return buildTokenResponse(user, workspace.getId());
    }

    // -------------------------------------------------------------------------
    // Logout
    // -------------------------------------------------------------------------

    /**
     * Revokes all refresh tokens for the given user (soft-revoke via revokedAt).
     */
    public void logout(UUID userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private TokenResponse buildTokenResponse(User user, UUID workspaceId) {
        String rawRefreshToken = jwtService.generateRefreshToken();
        String accessToken = jwtService.generateAccessToken(
                user.getId(), workspaceId, user.getRole().name());

        long expiryMs = jwtService.getRefreshTokenExpiry();
        LocalDateTime expiresAt = LocalDateTime.now()
                .plusSeconds(expiryMs / 1000);

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .tokenHash(sha256(rawRefreshToken))
                        .userId(user.getId())
                        .expiresAt(expiresAt)
                        .build()
        );

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .workspaceId(workspaceId)
                .build();
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
