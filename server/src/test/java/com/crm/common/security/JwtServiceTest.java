package com.crm.common.security;

import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link JwtService}.
 *
 * JwtService is instantiated directly (no Spring context needed).
 * Validates: Requirements 2.3, 2.5, 4.4
 */
class JwtServiceTest {

    private static final String SECRET = "test-secret-key-256-bits-minimum-32chars!!";
    private static final long ACCESS_TOKEN_EXPIRY  = 900_000L;      // 15 min
    private static final long REFRESH_TOKEN_EXPIRY = 604_800_000L;  // 7 days

    private JwtService jwtService;

    private UUID userId;
    private UUID workspaceId;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY);
        userId = UUID.randomUUID();
        workspaceId = UUID.randomUUID();
    }

    // -------------------------------------------------------------------------
    // generateAccessToken / claims extraction
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("generateAccessToken: token contiene sub, workspaceId y role correctos")
    void generateAccessToken_claimsAreCorrect() {
        String token = jwtService.generateAccessToken(userId, workspaceId, "ADMIN");

        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.extractWorkspaceId(token)).isEqualTo(workspaceId);
        assertThat(jwtService.extractRole(token)).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("generateAccessToken: token es válido inmediatamente después de generarse")
    void generateAccessToken_isValidAfterGeneration() {
        String token = jwtService.generateAccessToken(userId, workspaceId, "MEMBER");

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    @DisplayName("generateAccessToken: expiración está en el futuro")
    void generateAccessToken_expirationIsInFuture() {
        long before = System.currentTimeMillis();
        String token = jwtService.generateAccessToken(userId, workspaceId, "ADMIN");
        Date expiration = jwtService.extractExpiration(token);

        assertThat(expiration.getTime()).isGreaterThan(before);
    }

    @Test
    @DisplayName("generateAccessToken: expiración es aproximadamente now + accessTokenExpiry")
    void generateAccessToken_expirationMatchesConfiguredExpiry() {
        long before = System.currentTimeMillis();
        String token = jwtService.generateAccessToken(userId, workspaceId, "ADMIN");
        long after = System.currentTimeMillis();

        Date expiration = jwtService.extractExpiration(token);
        long expMs = expiration.getTime();

        // Allow 2 seconds of clock drift
        assertThat(expMs).isBetween(before + ACCESS_TOKEN_EXPIRY - 2000, after + ACCESS_TOKEN_EXPIRY + 2000);
    }

    // -------------------------------------------------------------------------
    // generateRefreshToken
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("generateRefreshToken: retorna un UUID string no nulo")
    void generateRefreshToken_returnsNonNullUuidString() {
        String token = jwtService.generateRefreshToken();

        assertThat(token).isNotNull().isNotBlank();
        // Should be parseable as UUID
        assertThatCode(() -> UUID.fromString(token)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("generateRefreshToken: cada llamada retorna un token único")
    void generateRefreshToken_isUnique() {
        String t1 = jwtService.generateRefreshToken();
        String t2 = jwtService.generateRefreshToken();

        assertThat(t1).isNotEqualTo(t2);
    }

    // -------------------------------------------------------------------------
    // isTokenValid / isTokenExpired
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("isTokenValid: token con firma incorrecta retorna false")
    void isTokenValid_wrongSecret_returnsFalse() {
        JwtService otherService = new JwtService("completely-different-secret-key-32chars!!", ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY);
        String tokenFromOther = otherService.generateAccessToken(userId, workspaceId, "ADMIN");

        assertThat(jwtService.isTokenValid(tokenFromOther)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid: token expirado retorna false")
    void isTokenValid_expiredToken_returnsFalse() {
        // Create a service with 1ms expiry so the token expires immediately
        JwtService shortLivedService = new JwtService(SECRET, 1L, REFRESH_TOKEN_EXPIRY);
        String token = shortLivedService.generateAccessToken(userId, workspaceId, "ADMIN");

        // Wait for expiry
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}

        // isTokenValid catches ExpiredJwtException internally and returns false
        assertThat(shortLivedService.isTokenValid(token)).isFalse();
    }

    @Test
    @DisplayName("isTokenValid: token malformado retorna false")
    void isTokenValid_malformedToken_returnsFalse() {
        assertThat(jwtService.isTokenValid("not.a.jwt")).isFalse();
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    // -------------------------------------------------------------------------
    // extractClaims — invalid token throws JwtException
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("extractClaims: token inválido lanza JwtException")
    void extractClaims_invalidToken_throwsJwtException() {
        assertThatThrownBy(() -> jwtService.extractClaims("invalid.token.here"))
                .isInstanceOf(JwtException.class);
    }

    // -------------------------------------------------------------------------
    // getRefreshTokenExpiry
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("getRefreshTokenExpiry: retorna el valor configurado")
    void getRefreshTokenExpiry_returnsConfiguredValue() {
        assertThat(jwtService.getRefreshTokenExpiry()).isEqualTo(REFRESH_TOKEN_EXPIRY);
    }
}
