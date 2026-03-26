package com.crm.module.deal;

import com.crm.AbstractIntegrationTest;
import com.crm.module.deal.repository.DealRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
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

    private UUID workspaceId;
    private UUID pipelineId;
    private UUID stageNuevoLead;
    private UUID stageContactado;
    private UUID stageCerradoGanado;

    @BeforeEach
    void setUp() {
        // Limpiar en orden correcto
        jdbc.execute("DELETE FROM deal_stage_history");
        jdbc.execute("DELETE FROM deals");
        jdbc.execute("DELETE FROM pipeline_stages");
        jdbc.execute("DELETE FROM pipelines");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM workspaces");

        workspaceId = UUID.randomUUID();
        pipelineId = UUID.randomUUID();
        stageNuevoLead = UUID.randomUUID();
        stageContactado = UUID.randomUUID();
        stageCerradoGanado = UUID.randomUUID();

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
    }

    // ── Propiedad 8: summary.total == Σ deal.value (deals activos) ───────────

    /**
     * Propiedad 8: la suma del repositorio coincide con la suma aritmética de los deals activos.
     * Valida: Requisitos 18.1, 18.4
     */
    @Test
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
    @Test
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
    @Test
    @DisplayName("Req 18.1: pipeline sin deals activos retorna suma 0 (no null)")
    void pipelineSummary_noActiveDeals_returnsZero() {
        BigDecimal sum = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId);

        assertThat(sum)
                .as("Req 18.1: COALESCE garantiza que la suma sea 0 cuando no hay deals")
                .isNotNull()
                .isEqualByComparingTo(BigDecimal.ZERO);
    }

    // ── Req 17.1: conteo de deals activos ─────────────────────────────────────

    @Test
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

    @Test
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
                workspaceId, java.time.LocalDateTime.now().minusDays(1));

        assertThat(wonCount)
                .as("Req 18.2: solo los 2 deals en etapa isWon=true deben contarse")
                .isEqualTo(2);
    }

    // ── Propiedad 8 con múltiples etapas ─────────────────────────────────────

    @Test
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
}
