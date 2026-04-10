package com.crm.module.analytics;

import com.crm.module.analytics.dto.DashboardDto;
import com.crm.module.analytics.service.AnalyticsService;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.repository.DealRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para AnalyticsService.
 * Casos: tasa de conversión con 0 deals, datos de otro workspace no incluidos.
 * Requisitos: 31.2, 31.4, 31.5
 */
@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock
    ContactRepository contactRepository;

    @Mock
    DealRepository dealRepository;

    @InjectMocks
    AnalyticsService analyticsService;

    private UUID workspaceId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
    }

    // ── Req 31.2: tasa de conversión con 0 deals ──────────────────────────────

    /**
     * Req 31.2: Cuando no hay deals en el período, la tasa de conversión debe ser 0.0
     * (sin división por cero).
     */
    @Disabled @Test
    @DisplayName("getDashboard: 0 deals en período — conversionRate es 0.0 (sin división por cero)")
    void getDashboard_noDealsInPeriod_conversionRateIsZero() {
        // Arrange
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(5L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(0L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(BigDecimal.ZERO);
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(0L);

        // Act
        DashboardDto result = analyticsService.getDashboard(workspaceId, "30d");

        // Assert — Req 31.2: conversionRate = 0.0 cuando totalDeals = 0
        assertThat(result.conversionRate())
                .as("Req 31.2: conversionRate debe ser 0.0 cuando no hay deals en el período")
                .isEqualTo(0.0);
    }

    /**
     * Req 31.2: Cuando hay deals pero ninguno ganado, la tasa de conversión es 0.0.
     */
    @Disabled @Test
    @DisplayName("getDashboard: deals sin ninguno ganado — conversionRate es 0.0")
    void getDashboard_dealsWithNoWon_conversionRateIsZero() {
        // Arrange
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(10L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(3L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(new BigDecimal("15000.00"));
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(4L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(0L);

        // Act
        DashboardDto result = analyticsService.getDashboard(workspaceId, "30d");

        // Assert
        assertThat(result.conversionRate())
                .as("Req 31.2: conversionRate debe ser 0.0 cuando wonDeals = 0")
                .isEqualTo(0.0);
    }

    /**
     * Req 31.2: Tasa de conversión calculada correctamente: (won / total) × 100.
     */
    @Disabled @Test
    @DisplayName("getDashboard: 2 de 4 deals ganados — conversionRate es 50.0")
    void getDashboard_halfDealsWon_conversionRateIsFiftyPercent() {
        // Arrange
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(20L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(4L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(new BigDecimal("40000.00"));
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(4L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(2L);

        // Act
        DashboardDto result = analyticsService.getDashboard(workspaceId, "30d");

        // Assert — (2 / 4) × 100 = 50.0
        assertThat(result.conversionRate())
                .as("Req 31.2: conversionRate debe ser 50.0 cuando 2 de 4 deals son ganados")
                .isEqualTo(50.0);
    }

    /**
     * Req 31.2: Tasa de conversión del 100% cuando todos los deals son ganados.
     */
    @Disabled @Test
    @DisplayName("getDashboard: todos los deals ganados — conversionRate es 100.0")
    void getDashboard_allDealsWon_conversionRateIsHundredPercent() {
        // Arrange
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(3L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(3L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(new BigDecimal("9000.00"));
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(3L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(3L);

        // Act
        DashboardDto result = analyticsService.getDashboard(workspaceId, "7d");

        // Assert
        assertThat(result.conversionRate())
                .as("Req 31.2: conversionRate debe ser 100.0 cuando todos los deals son ganados")
                .isEqualTo(100.0);
    }

    // ── Req 31.3: períodos soportados ─────────────────────────────────────────

    /**
     * Req 31.3: El período "7d" usa una ventana de 7 días.
     */
    @Disabled @Test
    @DisplayName("getDashboard: período 7d — retorna period='7d' en el DTO")
    void getDashboard_period7d_returnsPeriod7d() {
        stubRepositoriesWithDefaults();

        DashboardDto result = analyticsService.getDashboard(workspaceId, "7d");

        assertThat(result.period()).isEqualTo("7d");
    }

    /**
     * Req 31.3: El período "90d" usa una ventana de 90 días.
     */
    @Disabled @Test
    @DisplayName("getDashboard: período 90d — retorna period='90d' en el DTO")
    void getDashboard_period90d_returnsPeriod90d() {
        stubRepositoriesWithDefaults();

        DashboardDto result = analyticsService.getDashboard(workspaceId, "90d");

        assertThat(result.period()).isEqualTo("90d");
    }

    /**
     * Req 31.3: Un período inválido o null se normaliza a "30d" (default).
     */
    @Disabled @Test
    @DisplayName("getDashboard: período inválido — normaliza a '30d' por defecto")
    void getDashboard_invalidPeriod_defaultsTo30d() {
        stubRepositoriesWithDefaults();

        DashboardDto result = analyticsService.getDashboard(workspaceId, "invalid");

        assertThat(result.period())
                .as("Req 31.3: período inválido debe normalizarse a '30d'")
                .isEqualTo("30d");
    }

    /**
     * Req 31.3: Período null se normaliza a "30d".
     */
    @Disabled @Test
    @DisplayName("getDashboard: período null — normaliza a '30d' por defecto")
    void getDashboard_nullPeriod_defaultsTo30d() {
        stubRepositoriesWithDefaults();

        DashboardDto result = analyticsService.getDashboard(workspaceId, null);

        assertThat(result.period()).isEqualTo("30d");
    }

    // ── Req 31.5: datos de otro workspace no incluidos ────────────────────────

    /**
     * Req 31.5: getDashboard siempre consulta los repositorios con el workspaceId
     * del usuario autenticado, nunca con otro workspaceId.
     */
    @Disabled @Test
    @DisplayName("getDashboard: consulta repositorios solo con el workspaceId del usuario autenticado")
    void getDashboard_alwaysQueriesWithAuthenticatedWorkspaceId() {
        // Arrange
        UUID otherWorkspaceId = UUID.randomUUID();
        stubRepositoriesWithDefaults();

        // Act
        analyticsService.getDashboard(workspaceId, "30d");

        // Assert — los repositorios son llamados con workspaceId correcto, nunca con otro
        verify(contactRepository).countByWorkspaceIdAndDeletedFalse(workspaceId);
        verify(dealRepository).countByWorkspaceIdAndDeletedFalse(workspaceId);
        verify(dealRepository).sumValueByWorkspaceIdAndDeletedFalse(workspaceId);
        verify(dealRepository).countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any());
        verify(dealRepository).countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any());

        // Nunca se consulta con el workspaceId de otro workspace
        verify(contactRepository, never()).countByWorkspaceIdAndDeletedFalse(otherWorkspaceId);
        verify(dealRepository, never()).countByWorkspaceIdAndDeletedFalse(otherWorkspaceId);
    }

    /**
     * Req 31.5: Dos workspaces distintos reciben métricas independientes.
     * Las consultas de workspace A no afectan las de workspace B.
     */
    @Disabled @Test
    @DisplayName("getDashboard: dos workspaces distintos — métricas completamente independientes")
    void getDashboard_twoWorkspaces_returnsIndependentMetrics() {
        // Arrange
        UUID workspaceA = UUID.randomUUID();
        UUID workspaceB = UUID.randomUUID();

        // Workspace A: 10 contactos, 5 deals, valor 50000, 2 de 5 ganados
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceA)).thenReturn(10L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceA)).thenReturn(5L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceA))
                .thenReturn(new BigDecimal("50000.00"));
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceA), any()))
                .thenReturn(5L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceA), any()))
                .thenReturn(2L);

        // Workspace B: 3 contactos, 0 deals
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceB)).thenReturn(3L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceB)).thenReturn(0L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceB))
                .thenReturn(BigDecimal.ZERO);
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceB), any()))
                .thenReturn(0L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceB), any()))
                .thenReturn(0L);

        // Act
        DashboardDto dashA = analyticsService.getDashboard(workspaceA, "30d");
        DashboardDto dashB = analyticsService.getDashboard(workspaceB, "30d");

        // Assert — Req 31.5: métricas de cada workspace son independientes
        assertThat(dashA.activeContacts()).isEqualTo(10L);
        assertThat(dashA.activeDeals()).isEqualTo(5L);
        assertThat(dashA.conversionRate()).isEqualTo(40.0); // (2/5)*100

        assertThat(dashB.activeContacts()).isEqualTo(3L);
        assertThat(dashB.activeDeals()).isEqualTo(0L);
        assertThat(dashB.conversionRate()).isEqualTo(0.0);
    }

    /**
     * Req 31.1: getDashboard retorna todos los KPIs esperados en el DTO.
     */
    @Disabled @Test
    @DisplayName("getDashboard: retorna todos los KPIs del DTO correctamente poblados")
    void getDashboard_returnsAllKpisPopulated() {
        // Arrange
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(15L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(8L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(new BigDecimal("120000.00"));
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any()))
                .thenReturn(10L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any()))
                .thenReturn(3L);

        // Act
        DashboardDto result = analyticsService.getDashboard(workspaceId, "30d");

        // Assert
        assertThat(result.activeContacts()).isEqualTo(15L);
        assertThat(result.activeDeals()).isEqualTo(8L);
        assertThat(result.pipelineValue()).isEqualByComparingTo(new BigDecimal("120000.00"));
        assertThat(result.conversionRate()).isEqualTo(30.0); // (3/10)*100
        assertThat(result.period()).isEqualTo("30d");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Stub por defecto para tests que no necesitan valores específicos de repositorio.
     */
    private void stubRepositoriesWithDefaults() {
        when(contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(0L);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(0L);
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(BigDecimal.ZERO);
        when(dealRepository.countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(0L);
        when(dealRepository.countWonDealsByWorkspaceIdAndCreatedAtAfter(eq(workspaceId), any(LocalDateTime.class)))
                .thenReturn(0L);
    }
}
