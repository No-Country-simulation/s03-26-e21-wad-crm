package com.crm.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * Handles JWT access token generation/validation and opaque refresh token generation.
 *
 * Access token claims: sub (userId), workspaceId, role, iat, exp (15 min).
 * Refresh token: random UUID string (opaque, not a JWT) — 7 days expiry managed by DB.
 *
 * Satisfies: Requirements 2.3, 2.5, 4.4
 */
@Slf4j
@Service
public class JwtService {

    private final String secret;
    private final long accessTokenExpiry;
    private final long refreshTokenExpiry;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry}") long accessTokenExpiry,
            @Value("${app.jwt.refresh-token-expiry}") long refreshTokenExpiry) {
        this.secret = secret;
        this.accessTokenExpiry = accessTokenExpiry;
        this.refreshTokenExpiry = refreshTokenExpiry;
    }

    // -------------------------------------------------------------------------
    // Token generation
    // -------------------------------------------------------------------------

    /**
     * Generates a signed JWT access token valid for {@code accessTokenExpiry} ms.
     *
     * @param userId      subject claim (UUID)
     * @param workspaceId workspace claim (UUID)
     * @param role        role claim (e.g. "ADMIN")
     * @return compact JWT string
     */
    public String generateAccessToken(UUID userId, UUID workspaceId, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiry);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("workspaceId", workspaceId.toString())
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    /**
     * Generates an opaque refresh token (random UUID string).
     * Expiry is enforced by the database record, not by the token itself.
     *
     * @return UUID string
     */
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    // -------------------------------------------------------------------------
    // Claims extraction
    // -------------------------------------------------------------------------

    /**
     * Parses and returns all claims from a signed access token.
     *
     * @throws io.jsonwebtoken.JwtException if the token is invalid or expired
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(extractClaims(token).getSubject());
    }

    public UUID extractWorkspaceId(String token) {
        return UUID.fromString(extractClaims(token).get("workspaceId", String.class));
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }

    // -------------------------------------------------------------------------
    // Validation
    // -------------------------------------------------------------------------

    /**
     * Returns {@code true} if the token has a valid signature and is not expired.
     */
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return !isTokenExpired(token);
        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Returns {@code true} if the token's expiration date is in the past.
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public long getRefreshTokenExpiry() {
        return refreshTokenExpiry;
    }
}
