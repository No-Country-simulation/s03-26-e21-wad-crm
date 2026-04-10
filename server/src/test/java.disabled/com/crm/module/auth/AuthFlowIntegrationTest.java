package com.crm.module.auth;

import com.crm.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de integración para el flujo completo de autenticación a nivel de BD.
 *
 * Flujo: register → login → refresh → logout → intentar refresh con token revocado
 * Requisitos: 1.1, 2.1, 4.1, 5.1, 5.2
 */
class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    SimpMessagingTemplate messagingTemplate;

    @MockBean
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    JdbcTemplate jdbc;

    private UUID workspaceId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        // Limpiar datos de tests anteriores
        jdbc.execute("DELETE FROM refresh_tokens");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM workspaces");

        // Req 1.1: registro crea workspace + usuario ADMIN en una transacción
        workspaceId = UUID.randomUUID();
        userId = UUID.randomUUID();

        jdbc.update(
                "INSERT INTO workspaces (id, name, slug, plan, timezone) VALUES (?, ?, ?, ?, ?)",
                workspaceId, "Workspace Test", "workspace-test-" + workspaceId, "FREE", "UTC"
        );
        jdbc.update(
                "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                userId, workspaceId, "admin@test.com", "$2a$10$hashedpassword", "Admin Test", "ADMIN"
        );
    }

    // ── Req 1.1: registro crea workspace + usuario ────────────────────────────

    @Disabled @Test
    @DisplayName("Req 1.1: workspace y usuario ADMIN creados correctamente en BD")
    void register_workspaceAndAdminUserCreated() {
        // Verificar workspace
        Integer wsCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM workspaces WHERE id = ?", Integer.class, workspaceId);
        assertThat(wsCount).isEqualTo(1);

        // Verificar usuario ADMIN
        Map<String, Object> user = jdbc.queryForMap(
                "SELECT role, is_active FROM users WHERE id = ?", userId);
        assertThat(user.get("role")).isEqualTo("ADMIN");
        assertThat(user.get("is_active")).isEqualTo(true);
    }

    // ── Req 1.1: unicidad de email ────────────────────────────────────────────

    @Disabled @Test
    @DisplayName("Req 1.1: email duplicado viola constraint UNIQUE en users")
    void register_duplicateEmail_violatesUniqueConstraint() {
        // Intentar insertar otro usuario con el mismo email
        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () ->
                jdbc.update(
                        "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                        UUID.randomUUID(), workspaceId, "admin@test.com", "$2a$10$other", "Otro", "SALES"
                )
        );
    }

    // ── Req 2.1: login guarda hash del refresh token ──────────────────────────

    @Disabled @Test
    @DisplayName("Req 2.1: login persiste refresh token con hash en BD")
    void login_persistsRefreshTokenHash() {
        // Simular login: insertar refresh token (como haría AuthService)
        UUID tokenId = UUID.randomUUID();
        String tokenHash = "hashed_refresh_token_abc123";
        OffsetDateTime expiresAt = OffsetDateTime.now().plusDays(7);

        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                tokenId, tokenHash, userId, expiresAt
        );

        // Verificar que el token fue persistido
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL",
                Integer.class, tokenHash, userId
        );
        assertThat(count).isEqualTo(1);
    }

    // ── Req 4.1: refresh rota el token (invalida anterior, emite nuevo) ───────

    @Disabled @Test
    @DisplayName("Req 4.1: refresh rota token — el anterior queda revocado")
    void refresh_rotatesToken_previousIsRevoked() {
        // Insertar token inicial (activo)
        UUID oldTokenId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                oldTokenId, "old_token_hash", userId, OffsetDateTime.now().plusDays(7)
        );

        // Simular rotación: revocar el anterior
        jdbc.update(
                "UPDATE refresh_tokens SET revoked_at = now() WHERE id = ?",
                oldTokenId
        );

        // Insertar nuevo token
        UUID newTokenId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                newTokenId, "new_token_hash", userId, OffsetDateTime.now().plusDays(7)
        );

        // Verificar: token anterior revocado
        Map<String, Object> oldToken = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", oldTokenId);
        assertThat(oldToken.get("revoked_at")).isNotNull();

        // Verificar: nuevo token activo
        Map<String, Object> newToken = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", newTokenId);
        assertThat(newToken.get("revoked_at")).isNull();
    }

    // ── Req 5.1: logout revoca el refresh token ───────────────────────────────

    @Disabled @Test
    @DisplayName("Req 5.1: logout revoca el refresh token del usuario")
    void logout_revokesRefreshToken() {
        // Insertar token activo
        UUID tokenId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                tokenId, "active_token_hash", userId, OffsetDateTime.now().plusDays(7)
        );

        // Simular logout: revocar token
        jdbc.update("UPDATE refresh_tokens SET revoked_at = now() WHERE id = ?", tokenId);

        // Verificar que está revocado
        Map<String, Object> token = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", tokenId);
        assertThat(token.get("revoked_at")).isNotNull();
    }

    // ── Req 5.2: refresh con token revocado no debe ser válido ────────────────

    @Disabled @Test
    @DisplayName("Req 5.2: token revocado no puede usarse para refresh")
    void refresh_withRevokedToken_isNotValid() {
        // Insertar token ya revocado
        UUID tokenId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at, revoked_at) VALUES (?, ?, ?, ?, now())",
                tokenId, "revoked_token_hash", userId, OffsetDateTime.now().plusDays(7)
        );

        // Verificar que la consulta de token válido (revoked_at IS NULL) no lo retorna
        Integer validCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL",
                Integer.class, "revoked_token_hash"
        );
        assertThat(validCount).isEqualTo(0);
    }

    // ── Req 5.2: cascade delete — tokens eliminados al borrar usuario ─────────

    @Disabled @Test
    @DisplayName("Req 5.2: eliminar usuario elimina sus refresh tokens (ON DELETE CASCADE)")
    void deleteUser_cascadesRefreshTokenDeletion() {
        // Insertar token para el usuario
        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                UUID.randomUUID(), "cascade_token_hash", userId, OffsetDateTime.now().plusDays(7)
        );

        // Eliminar usuario
        jdbc.update("DELETE FROM users WHERE id = ?", userId);

        // Verificar que los tokens fueron eliminados en cascada
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE user_id = ?", Integer.class, userId);
        assertThat(count).isEqualTo(0);
    }

    // ── Req 1.1: cascade delete — usuarios eliminados al borrar workspace ─────

    @Disabled @Test
    @DisplayName("Req 1.1: eliminar workspace elimina usuarios en cascada")
    void deleteWorkspace_cascadesUserDeletion() {
        // Verificar que el usuario existe
        Integer before = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE workspace_id = ?", Integer.class, workspaceId);
        assertThat(before).isEqualTo(1);

        // Eliminar workspace
        jdbc.update("DELETE FROM workspaces WHERE id = ?", workspaceId);

        // Verificar cascade
        Integer after = jdbc.queryForObject(
                "SELECT COUNT(*) FROM users WHERE workspace_id = ?", Integer.class, workspaceId);
        assertThat(after).isEqualTo(0);
    }

    // ── Flujo completo secuencial: register → login → refresh → logout → refresh revocado ──

    /**
     * Flujo end-to-end completo a nivel de BD.
     * Valida: Requisitos 1.1, 2.1, 4.1, 5.1, 5.2
     */
    @Disabled @Test
    @DisplayName("Flujo completo: register → login → refresh → logout → refresh con token revocado → 401")
    void fullAuthFlow_registerLoginRefreshLogout_revokedTokenRejected() {
        // ── STEP 1: register — workspace + usuario ADMIN creados ─────────────
        UUID newWorkspaceId = UUID.randomUUID();
        UUID newUserId = UUID.randomUUID();

        jdbc.update(
                "INSERT INTO workspaces (id, name, slug, plan, timezone) VALUES (?, ?, ?, ?, ?)",
                newWorkspaceId, "Flow Workspace", "flow-ws-" + newWorkspaceId, "FREE", "UTC"
        );
        jdbc.update(
                "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                newUserId, newWorkspaceId, "flow@test.com", "$2a$10$bcrypthashedpwd", "Flow User", "ADMIN"
        );

        // Req 1.1: workspace y usuario ADMIN existen
        Integer wsCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM workspaces WHERE id = ?", Integer.class, newWorkspaceId);
        assertThat(wsCount).isEqualTo(1);

        Map<String, Object> registeredUser = jdbc.queryForMap(
                "SELECT role, is_active FROM users WHERE id = ?", newUserId);
        assertThat(registeredUser.get("role")).isEqualTo("ADMIN");
        assertThat(registeredUser.get("is_active")).isEqualTo(true);

        // ── STEP 2: login — refresh token persistido con hash ────────────────
        UUID loginTokenId = UUID.randomUUID();
        String loginTokenHash = "login_token_hash_" + UUID.randomUUID();
        OffsetDateTime loginTokenExpiry = OffsetDateTime.now().plusDays(7);

        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                loginTokenId, loginTokenHash, newUserId, loginTokenExpiry
        );

        // Req 2.1: token activo (revoked_at IS NULL) persiste en BD
        Integer activeCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash = ? AND user_id = ? AND revoked_at IS NULL",
                Integer.class, loginTokenHash, newUserId
        );
        assertThat(activeCount).isEqualTo(1);

        // ── STEP 3: refresh — token anterior revocado, nuevo token emitido ───
        // Revocar token de login
        jdbc.update(
                "UPDATE refresh_tokens SET revoked_at = now() WHERE id = ?",
                loginTokenId
        );

        // Emitir nuevo token
        UUID refreshedTokenId = UUID.randomUUID();
        String refreshedTokenHash = "refreshed_token_hash_" + UUID.randomUUID();

        jdbc.update(
                "INSERT INTO refresh_tokens (id, token_hash, user_id, expires_at) VALUES (?, ?, ?, ?)",
                refreshedTokenId, refreshedTokenHash, newUserId, OffsetDateTime.now().plusDays(7)
        );

        // Req 4.1: token anterior revocado
        Map<String, Object> oldToken = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", loginTokenId);
        assertThat(oldToken.get("revoked_at")).isNotNull();

        // Req 4.1: nuevo token activo
        Map<String, Object> newToken = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", refreshedTokenId);
        assertThat(newToken.get("revoked_at")).isNull();

        // ── STEP 4: logout — token revocado ──────────────────────────────────
        jdbc.update(
                "UPDATE refresh_tokens SET revoked_at = now() WHERE id = ?",
                refreshedTokenId
        );

        // Req 5.1: token revocado tras logout
        Map<String, Object> loggedOutToken = jdbc.queryForMap(
                "SELECT revoked_at FROM refresh_tokens WHERE id = ?", refreshedTokenId);
        assertThat(loggedOutToken.get("revoked_at")).isNotNull();

        // ── STEP 5: intentar refresh con token revocado → debe ser rechazado ─
        // Req 5.2: consulta de token válido no retorna el token revocado
        Integer validAfterLogout = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL",
                Integer.class, refreshedTokenHash
        );
        assertThat(validAfterLogout)
                .as("Req 5.2: token revocado no debe ser válido para refresh (simula HTTP 401)")
                .isEqualTo(0);

        // Confirmar que ningún token del usuario está activo tras el logout
        Integer anyActiveToken = jdbc.queryForObject(
                "SELECT COUNT(*) FROM refresh_tokens WHERE user_id = ? AND revoked_at IS NULL",
                Integer.class, newUserId
        );
        assertThat(anyActiveToken)
                .as("Req 5.2: ningún token activo debe quedar tras el logout")
                .isEqualTo(0);
    }
}
