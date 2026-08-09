package com.crm.module.auth.controller;

import com.crm.common.security.JwtService;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.auth.dto.GoogleAuthRequest;
import com.crm.module.auth.dto.LoginRequest;
import com.crm.module.auth.dto.RefreshRequest;
import com.crm.module.auth.dto.RegisterRequest;
import com.crm.module.auth.dto.TokenResponse;
import com.crm.module.auth.service.AuthService;
import com.crm.module.auth.service.GoogleOAuthService;
import com.crm.module.user.entity.User;
import com.crm.module.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Public authentication endpoints.
 *
 * Satisfies: Requirements 1.1, 2.1, 3.1, 4.1, 5.1
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, GoogleOAuthService googleOAuthService, JwtService jwtService, UserRepository userRepository) {
        this.authService = authService;
        this.googleOAuthService = googleOAuthService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/dev-create-user")
    public ResponseEntity<TokenResponse> createDevUser(@RequestBody DevUserRequest request) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(request.email());
        registerRequest.setPassword(request.password());
        registerRequest.setName(request.name());
        registerRequest.setCompanyName(request.companyName() != null ? request.companyName() : "Dev Company");
        
        TokenResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/google")
    public ResponseEntity<TokenResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        TokenResponse response = googleOAuthService.authenticate(request.getIdToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        TokenResponse response = authService.refresh(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7); // strip "Bearer "
        UUID userId = jwtService.extractUserId(token);
        authService.logout(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get current user info (including workspaceId).
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(
            @RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        UUID userId = jwtService.extractUserId(token);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        return ResponseEntity.ok(new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getWorkspaceId(),
                user.getRole().getName()
        ));
    }

    // DTO for user info
    public record UserInfoResponse(UUID id, String email, String name, UUID workspaceId, String role) {}

    // Dev endpoint to create test user
    public record DevUserRequest(String email, String password, String name, String companyName) {}
}
