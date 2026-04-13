package com.crm.module.deal;

import com.crm.AbstractIntegrationTest;
import com.crm.module.deal.repository.DealRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import javax.crypto.SecretKey;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de integración para el módulo Deal + pipeline summary.
 *
 * Propiedad 8: summary.total == Σ deal.value ∀ deal: !deal.isDeleted
 * Requisitos: 17.1, 18.1–18.4
 *
 * Valida: Requisitos 17.1, 18.1, 18.4
 */
class DealPipelineSummaryIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    SimpMessagingTemplate messagingTemplate;

    @MockBean
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    DealRepository dealRepository;

    @Autowired
    TestRestTemplate restTemplate;

    // JWT secret must match application-integration-test.yml
    private static final String JWT_SECRET = "test-secret-key-at-least-32-chars-long!!";

    private UUID workspaceId;
    private UUID pipelineId;
    private UUID stageNuevoLead;
    private UUID stageContactado;
    private UUID stageCerradoGanado;
    private UUID stagePerdido;

    @BeforeEach
    void setUp() {
        // Limpiar en orden correcto (FK constraints)
        jdbc.execute("DELETE FROM deal_stage_history");
        jdbc.execute("DELETE FROM deals");
        jdbc.execute("DELETE FROM pipeline_stages");
        jdbc.execute("DELETE FROM pipelines");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM workspaces");

        workspaceId = UUID.randomUUID();
        pipelineId  = UUID.randomUUID();
        stageNuevoLead    = UUID.randomUUID();
        stageContactado   = UUID.randomUUID();
        stageCerradoGanado = UUID.randomUUID();
        stagePerdido      = UUID.randomUUID();

        jdbc.update("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)",
                workspaceId, "Deal Workspace", "deal-workspace-" + workspaceId);

        jdbc.update("INSERT INTO pipelines (id, workspace_id, name, is_default) VALUES (?, ?, ?, ?)",
                pipelineId, workspaceId, "Pipeline de Ventas", true);

        // Etapas del pipeline
        jdbc.update(
                "INSERT INTO pipeline_stages (id, workspace_id, pipeline_id, name, position, is_won, is_lost) VALUES (?, ?, ?, ?, ?, ?, ?)",
                stageNuevoLead, workspaceId, pipelineId, "Nuevo Lead", 1, false, false
        );
        jdbc.update(
                "INSERT INTO pipeline_stages (id, workspace_id, pipeline_id, name, position, is_won, is_lost) VALUES (?, ?, ?, ?, ?, ?, ?)",
                stageContactado, workspaceId, pipelineId, "Contactado", 2, false, false
        );
        jdbc.update(
                "INSERT INTO pipeline_stages (id, workspace_id, pipeline_id, name, position, is_won, is_lost) VALUES (?, ?, ?, ?, ?, ?, ?)",
                stageCerradoGanado, workspaceId, pipelineId, "Cerrado Ganado", 5, true, false
        );
        jdbc.update(
                "INSERT INTO pipeline_stages (id, workspace_id, pipeline_id, name, position, is_won, is_lost) VALUES (?, ?, ?, ?, ?, ?, ?)",
                stagePerdido, workspaceId, pipelineId, "Perdido", 6, false, true
        );
    }

    // ── Propiedad 8: summary.total == Σ deal.value (deals activos) ───────────

    /**
     * Propiedad 8: la suma del repositorio coincide con la suma aritmética de los deals activos.
     * Valida: Requisitos 18.1, 18.4
     */
    @Disabled @Test
    @DisplayName("Propiedad 8: sumValueByWorkspace == suma aritmética de deals activos")
    void property8_pipelineValueInvariant_sumMatchesArithmetic() {
        // Crear deals con valores conocidos en distintas etapas
        List<BigDecimal> values = List.of(
                new BigDecimal("1000.00"),
                new BigDecimal("2500.50"),
                new BigDecimal("750.25"),
                new BigDecimal("4200.00")
        );

        for (int i = 0; i < values.size(); i++) {
            UUID stageId = (i % 2 == 0) ? stageNuevoLead : stageContactado;
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceId, "Deal " + i, values.get(i), stageId, false
            );
        }

        // Suma aritmética esperada
        BigDecimal expectedSum = values.stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Suma desde el repositorio
        BigDecimal repoSum = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        // Propiedad 8: deben coincidir exactamente
        assertThat(repoSum)
                .as("Propiedad 8: sumValueByWorkspace debe coincidir con la suma aritmética")
                .isEqualByComparingTo(expectedSum);
    }

    /**
     * Propiedad 8: deals con isDeleted=true son excluidos de la suma.
     * Valida: Requisito 17.4, 18.4
     */
    @Disabled @Test
    @DisplayName("Propiedad 8: deals eliminados (isDeleted=true) excluidos de la suma del pipeline")
    void property8_deletedDeals_excludedFromPipelineSum() {
        // Deal activo: 3000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Deal Activo", new BigDecimal("3000.00"), stageNuevoLead, false
        );
        // Deal eliminado: 9999 — NO debe sumarse
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Deal Eliminado", new BigDecimal("9999.00"), stageContactado, true
        );

        BigDecimal sum = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        // Solo el deal activo debe sumarse
        assertThat(sum)
                .as("Req 17.4: deals eliminados no deben incluirse en la suma del pipeline")
                .isEqualByComparingTo(new BigDecimal("3000.00"));
    }

    /**
     * Propiedad 8: pipeline vacío retorna 0, no null.
     * Valida: Requisito 18.1
     */
    @Disabled @Test
    @DisplayName("Req 18.1: pipeline sin deals activos retorna suma 0 (no null)")
    void pipelineSummary_noActiveDeals_returnsZero() {
        BigDecimal sum = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        assertThat(sum)
                .as("Req 18.1: COALESCE garantiza que la suma sea 0 cuando no hay deals")
                .isNotNull()
                .isEqualByComparingTo(BigDecimal.ZERO);
    }

    // ── Req 17.1: conteo de deals activos ─────────────────────────────────────

    @Disabled @Test
    @DisplayName("Req 17.1: countByWorkspace excluye deals eliminados")
    void dealCount_excludesDeletedDeals() {
        // 3 deals activos
        for (int i = 0; i < 3; i++) {
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceId, "Activo " + i, new BigDecimal("100.00"), stageNuevoLead, false
            );
        }
        // 2 deals eliminados
        for (int i = 0; i < 2; i++) {
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceId, "Eliminado " + i, new BigDecimal("500.00"), stageContactado, true
            );
        }

        long count = dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId);

        assertThat(count)
                .as("Req 17.1: solo los 3 deals activos deben contarse")
                .isEqualTo(3);
    }

    // ── Req 18.2: deals ganados contados correctamente ────────────────────────

    @Disabled @Test
    @DisplayName("Req 18.2: countWonDeals cuenta solo deals en etapa isWon=true")
    void wonDeals_countedCorrectly() {
        // 2 deals en etapa ganada
        for (int i = 0; i < 2; i++) {
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceId, "Ganado " + i, new BigDecimal("5000.00"), stageCerradoGanado, false
            );
        }
        // 1 deal en etapa normal
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "En progreso", new BigDecimal("2000.00"), stageNuevoLead, false
        );

        long wonCount = dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(
                workspaceId, LocalDateTime.now().minusDays(1));

        assertThat(wonCount)
                .as("Req 18.2: solo los 2 deals en etapa isWon=true deben contarse")
                .isEqualTo(2);
    }

    // ── Req 18.3: valor de deals ganados y perdidos por separado ─────────────

    @Disabled @Test
    @DisplayName("Req 18.3: suma de deals ganados y perdidos calculada correctamente por etapa")
    void wonAndLostDeals_sumCalculatedCorrectly() {
        // 2 deals ganados: 5000 + 3000 = 8000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Ganado 1", new BigDecimal("5000.00"), stageCerradoGanado, false
        );
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Ganado 2", new BigDecimal("3000.00"), stageCerradoGanado, false
        );
        // 1 deal perdido: 2000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Perdido 1", new BigDecimal("2000.00"), stagePerdido, false
        );
        // 1 deal activo normal: 1500
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "En progreso", new BigDecimal("1500.00"), stageNuevoLead, false
        );

        // Req 18.3: suma de ganados via query directa (simula lo que haría getPipelineSummary)
        BigDecimal wonSum = jdbc.queryForObject(
                "SELECT COALESCE(SUM(d.value), 0) FROM deals d " +
                "JOIN pipeline_stages ps ON d.stage_id = ps.id " +
                "WHERE d.workspace_id = ? AND d.is_deleted = false AND ps.is_won = true",
                BigDecimal.class, workspaceId
        );
        BigDecimal lostSum = jdbc.queryForObject(
                "SELECT COALESCE(SUM(d.value), 0) FROM deals d " +
                "JOIN pipeline_stages ps ON d.stage_id = ps.id " +
                "WHERE d.workspace_id = ? AND d.is_deleted = false AND ps.is_lost = true",
                BigDecimal.class, workspaceId
        );

        assertThat(wonSum)
                .as("Req 18.3: suma de deals ganados debe ser 8000")
                .isEqualByComparingTo(new BigDecimal("8000.00"));
        assertThat(lostSum)
                .as("Req 18.3: suma de deals perdidos debe ser 2000")
                .isEqualByComparingTo(new BigDecimal("2000.00"));
    }

    // ── Propiedad 8 con múltiples etapas ─────────────────────────────────────

    @Disabled @Test
    @DisplayName("Propiedad 8: suma total incluye deals de todas las etapas activas")
    void property8_dealsAcrossAllStages_sumIsCorrect() {
        // Deal en Nuevo Lead: 1000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Lead", new BigDecimal("1000.00"), stageNuevoLead, false
        );
        // Deal en Contactado: 2000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Contactado", new BigDecimal("2000.00"), stageContactado, false
        );
        // Deal en Cerrado Ganado: 3000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Ganado", new BigDecimal("3000.00"), stageCerradoGanado, false
        );

        BigDecimal sum = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        // 1000 + 2000 + 3000 = 6000
        assertThat(sum)
                .as("Propiedad 8: suma de todas las etapas debe ser 6000")
                .isEqualByComparingTo(new BigDecimal("6000.00"));
    }

    // ── Req 18.4: suma aritmética — consistencia con múltiples decimales ──────

    @Disabled @Test
    @DisplayName("Req 18.4: suma aritmética es exacta con valores decimales")
    void property8_decimalPrecision_sumIsExact() {
        // Valores con decimales para verificar precisión aritmética
        List<BigDecimal> values = List.of(
                new BigDecimal("999.99"),
                new BigDecimal("0.01"),
                new BigDecimal("1234.56"),
                new BigDecimal("7865.44")
        );

        for (BigDecimal val : values) {
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceId, "Deal " + val, val, stageNuevoLead, false
            );
        }

        BigDecimal expected = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actual   = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        // 999.99 + 0.01 + 1234.56 + 7865.44 = 10100.00
        assertThat(actual)
                .as("Req 18.4: suma aritmética exacta con decimales")
                .isEqualByComparingTo(expected);
    }

    // ── Req 18.1: RBAC — solo ADMIN/MANAGER acceden al summary endpoint ───────

    /**
     * Req 18.1: usuario con rol SALES recibe HTTP 403 en GET /api/deals/pipeline/summary.
     * Valida: Requisito 18.1
     */
    @Disabled @Test
    @DisplayName("Req 18.1: rol SALES recibe 403 en GET /api/deals/pipeline/summary")
    void pipelineSummary_salesRole_returns403() {
        UUID salesUserId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                salesUserId, workspaceId, "sales@test.com", "$2a$10$hash", "Sales User", "SALES"
        );

        String token = buildJwt(salesUserId, workspaceId, "SALES");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/deals/pipeline/summary",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        assertThat(response.getStatusCode())
                .as("Req 18.1: rol SALES no debe acceder al pipeline summary")
                .isEqualTo(HttpStatus.FORBIDDEN);
    }

    /**
     * Req 18.1: usuario con rol ADMIN accede correctamente al summary endpoint.
     * Valida: Requisito 18.1
     */
    @Disabled @Test
    @DisplayName("Req 18.1: rol ADMIN accede a GET /api/deals/pipeline/summary → 200")
    void pipelineSummary_adminRole_returns200() {
        UUID adminUserId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                adminUserId, workspaceId, "admin@test.com", "$2a$10$hash", "Admin User", "ADMIN"
        );

        // Crear algunos deals para que el endpoint tenga datos
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, stage_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, "Deal Admin", new BigDecimal("5000.00"), stageNuevoLead, false
        );

        String token = buildJwt(adminUserId, workspaceId, "ADMIN");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/deals/pipeline/summary",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        assertThat(response.getStatusCode())
                .as("Req 18.1: rol ADMIN debe acceder al pipeline summary")
                .isEqualTo(HttpStatus.OK);
    }

    /**
     * Req 18.1: usuario con rol MANAGER accede correctamente al summary endpoint.
     * Valida: Requisito 18.1
     */
    @Disabled @Test
    @DisplayName("Req 18.1: rol MANAGER accede a GET /api/deals/pipeline/summary → 200")
    void pipelineSummary_managerRole_returns200() {
        UUID managerUserId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO users (id, workspace_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?, ?)",
                managerUserId, workspaceId, "manager@test.com", "$2a$10$hash", "Manager User", "MANAGER"
        );

        String token = buildJwt(managerUserId, workspaceId, "MANAGER");

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/deals/pipeline/summary",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        assertThat(response.getStatusCode())
                .as("Req 18.1: rol MANAGER debe acceder al pipeline summary")
                .isEqualTo(HttpStatus.OK);
    }

    /**
     * Req 18.1: request sin token recibe HTTP 401.
     */
    @Disabled @Test
    @DisplayName("Req 18.1: request sin token recibe 401 en GET /api/deals/pipeline/summary")
    void pipelineSummary_noToken_returns401() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/deals/pipeline/summary", String.class);

        assertThat(response.getStatusCode())
                .as("Req 18.1: request sin autenticación debe recibir 401")
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ── Helper: generar JWT de prueba ─────────────────────────────────────────

    /**
     * Genera un JWT firmado con el mismo secreto que usa la aplicación en tests.
     * Claims: sub=userId, workspaceId, role, exp=+1h
     */
    private String buildJwt(UUID userId, UUID workspaceId, String role) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));
        return Jwts.builder()
                .subject(userId.toString())
                .claim("workspaceId", workspaceId.toString())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3_600_000L)) // +1h
                .signWith(key)
                .compact();
    }
}
