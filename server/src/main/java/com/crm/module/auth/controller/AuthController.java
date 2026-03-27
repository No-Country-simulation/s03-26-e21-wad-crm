package com.crm.module.auth.controller;

import com.crm.common.security.JwtService;
import com.crm.module.auth.dto.GoogleAuthRequest;
import com.crm.module.auth.dto.LoginRequest;
import com.crm.module.auth.dto.RefreshRequest;
import com.crm.module.auth.dto.RegisterRequest;
import com.crm.module.auth.dto.TokenResponse;
import com.crm.module.auth.service.AuthService;
import com.crm.module.auth.service.GoogleOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthService googleOAuthService;
    private final JwtService jwtService;

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
}
