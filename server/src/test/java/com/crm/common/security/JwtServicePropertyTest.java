package com.crm.common.security;

import com.crm.module.user.entity.UserRole;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.BeforeProperty;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for JwtService JWT claims round-trip.
 *
 * Validates: Requirement 2.3
 *
 * Property 1: Round-trip de claims
 *   decode(generate(userId, workspaceId, role)).workspaceId == workspaceId
 *   decode(generate(userId, workspaceId, role)).userId      == userId
 *   decode(generate(userId, workspaceId, role)).role        == role.name()
 */
class JwtServicePropertyTest {

    private static final String SECRET = "test-secret-key-256-bits-minimum-32chars!!";
    private static final long ACCESS_TOKEN_EXPIRY = 900_000L;   // 15 min
    private static final long REFRESH_TOKEN_EXPIRY = 604_800_000L; // 7 days

    private JwtService jwtService;

    @BeforeProperty
    void setUp() {
        jwtService = new JwtService(SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY);
    }

    /**
     * Property 1a: workspaceId round-trip
     * decode(generate(userId, workspaceId, role)).workspaceId == workspaceId
     *
     * Validates: Requirement 2.3
     */
    @Property
    void workspaceIdRoundTrip(
            @ForAll("uuids") UUID userId,
            @ForAll("uuids") UUID workspaceId,
            @ForAll("roles") UserRole role) {

        String token = jwtService.generateAccessToken(userId, workspaceId, role.name());
        UUID extracted = jwtService.extractWorkspaceId(token);

        assertThat(extracted).isEqualTo(workspaceId);
    }

    /**
     * Property 1b: userId round-trip
     * decode(generate(userId, workspaceId, role)).userId == userId
     *
     * Validates: Requirement 2.3
     */
    @Property
    void userIdRoundTrip(
            @ForAll("uuids") UUID userId,
            @ForAll("uuids") UUID workspaceId,
            @ForAll("roles") UserRole role) {

        String token = jwtService.generateAccessToken(userId, workspaceId, role.name());
        UUID extracted = jwtService.extractUserId(token);

        assertThat(extracted).isEqualTo(userId);
    }

    /**
     * Property 1c: role round-trip
     * decode(generate(userId, workspaceId, role)).role == role.name()
     *
     * Validates: Requirement 2.3
     */
    @Property
    void roleRoundTrip(
            @ForAll("uuids") UUID userId,
            @ForAll("uuids") UUID workspaceId,
            @ForAll("roles") UserRole role) {

        String token = jwtService.generateAccessToken(userId, workspaceId, role.name());
        String extracted = jwtService.extractRole(token);

        assertThat(extracted).isEqualTo(role.name());
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
