package com.crm.common.security;

import com.crm.module.user.entity.UserRole;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.BeforeProperty;

import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based test for JWT token expiration invariant.
 *
 * **Validates: Requirement 2.5**
 *
 * Property 2: Expiration invariant
 *   accessToken.exp < refreshToken.exp — always true for ALL emitted token pairs.
 *
 * The access token carries its expiry as a JWT `exp` claim.
 * The refresh token is opaque (UUID); its expiry is enforced by the DB record
 * created at (now + refreshTokenExpiry ms). We verify the invariant by comparing
 * the access token's exp against the earliest possible refresh token expiry
 * (issuedAt + refreshTokenExpiry), which must always be strictly greater.
 */
class JwtTokenExpirationPropertyTest {

    private static final String SECRET = "test-secret-key-256-bits-minimum-32chars!!";
    private static final long ACCESS_TOKEN_EXPIRY  = 900_000L;       // 15 min in ms
    private static final long REFRESH_TOKEN_EXPIRY = 604_800_000L;   // 7 days in ms

    private JwtService jwtService;

    @BeforeProperty
    void setUp() {
        jwtService = new JwtService(SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY);
    }

    /**
     * Property 2: accessToken.exp < refreshToken.exp
     *
     * For every combination of (userId, workspaceId, role), the access token's
     * expiration timestamp must be strictly less than the refresh token's
     * expiration timestamp (now + refreshTokenExpiry).
     *
     * **Validates: Requirement 2.5**
     */
    @Property
    void accessTokenExpiresBeforeRefreshToken(
            @ForAll("uuids") UUID userId,
            @ForAll("uuids") UUID workspaceId,
            @ForAll("roles") UserRole role) {

        long issuedAt = System.currentTimeMillis();

        String accessToken = jwtService.generateAccessToken(userId, workspaceId, role.name());

        // Access token exp is embedded in the JWT
        Date accessTokenExp = jwtService.extractExpiration(accessToken);

        // Refresh token exp = issuedAt + refreshTokenExpiry (enforced by DB record)
        long refreshTokenExpMs = issuedAt + jwtService.getRefreshTokenExpiry();

        assertThat(accessTokenExp.getTime())
                .as("accessToken.exp (%d) must be strictly less than refreshToken.exp (%d)",
                        accessTokenExp.getTime(), refreshTokenExpMs)
                .isLessThan(refreshTokenExpMs);
    }

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    @Provide
    Arbitrary<UUID> uuids() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<UserRole> roles() {
        return Arbitraries.of(UserRole.values());
    }
}
