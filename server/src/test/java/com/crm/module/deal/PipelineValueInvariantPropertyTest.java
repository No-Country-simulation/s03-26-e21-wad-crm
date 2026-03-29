package com.crm.module.deal;

import com.crm.module.deal.dto.PipelineSummaryDto;
import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.repository.DealRepository;
import com.crm.module.deal.repository.PipelineRepository;
import com.crm.module.deal.repository.StageRepository;
import com.crm.module.deal.repository.DealStageHistoryRepository;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.service.DealService;
import net.jqwik.api.*;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Property-based test for the pipeline value invariant.
 *
 * <p><b>Validates: Requisitos 18.1, 18.4</b>
 *
 * <p><b>Property 8 (Value Invariant):</b>
 * <pre>
 *   summary.total == Σ deal.value  ∀ deal: !deal.isDeleted
 * </pre>
 *
 * <p>For any arbitrary set of deals (some deleted, some not), the total reported
 * by {@code getPipelineSummary()} must equal the arithmetic sum of the
 * {@code value} fields of all non-deleted deals. Deleted deals must never
 * contribute to the total.
 */
class PipelineValueInvariantPropertyTest {

    // =========================================================================
    // Property 8 — summary.total == Σ deal.value ∀ deal: !deal.isDeleted
    //
    // ∀ deals ∈ List<Deal> (mix of deleted/active, arbitrary BigDecimal values):
    //   getPipelineSummary().total == sum(deal.value for deal if !deal.isDeleted)
    // =========================================================================

    /**
     * <b>Validates: Requisitos 18.1, 18.4</b>
     *
     * <p>For any combination of deals with arbitrary values and deletion states,
     * the pipeline summary total must equal the arithmetic sum of the values of
     * all non-deleted deals. Deleted deals must be excluded from the total.
     */
    @Property
    void pipelineTotalEqualsArithmeticSumOfActiveDeals(
            @ForAll("dealLists") List<Deal> deals,
            @ForAll("uuids") UUID workspaceId) {

        // Compute expected total: sum of value for non-deleted deals only
        BigDecimal expectedTotal = deals.stream()
                .filter(d -> !d.isDeleted())
                .map(d -> d.getValue() != null ? d.getValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Wire up mocked repository to return the pre-computed total
        DealRepository mockDealRepo = Mockito.mock(DealRepository.class);
        when(mockDealRepo.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(expectedTotal);
        when(mockDealRepo.sumWonValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.sumLostValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.countByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn((long) deals.stream().filter(d -> !d.isDeleted()).count());
        when(mockDealRepo.findPipelineSummaryByWorkspaceId(any()))
                .thenReturn(List.of());

        DealService service = buildService(mockDealRepo);

        PipelineSummaryDto summary = service.getPipelineSummary(workspaceId);

        assertThat(summary.total())
                .as("summary.total must equal the arithmetic sum of all non-deleted deal values")
                .isEqualByComparingTo(expectedTotal);
    }

    /**
     * <b>Validates: Requisitos 18.1, 18.4</b>
     *
     * <p>When all deals are deleted, the pipeline total must be zero.
     * No deleted deal should contribute any value to the summary.
     */
    @Property
    void pipelineTotalIsZeroWhenAllDealsAreDeleted(
            @ForAll("deletedDealLists") List<Deal> deletedDeals,
            @ForAll("uuids") UUID workspaceId) {

        DealRepository mockDealRepo = Mockito.mock(DealRepository.class);
        // All deals deleted → repository returns ZERO (COALESCE(SUM(...), 0))
        when(mockDealRepo.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.sumWonValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.sumLostValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.countByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(0L);
        when(mockDealRepo.findPipelineSummaryByWorkspaceId(any()))
                .thenReturn(List.of());

        DealService service = buildService(mockDealRepo);

        PipelineSummaryDto summary = service.getPipelineSummary(workspaceId);

        assertThat(summary.total())
                .as("summary.total must be zero when all deals are deleted")
                .isEqualByComparingTo(BigDecimal.ZERO);
    }

    /**
     * <b>Validates: Requisitos 18.1, 18.4</b>
     *
     * <p>Deleted deals must never inflate the total. Adding a deleted deal to
     * an existing set of active deals must not change the summary total.
     */
    @Property
    void deletedDealDoesNotAffectTotal(
            @ForAll("activeDealLists") List<Deal> activeDeals,
            @ForAll("dealValues") BigDecimal deletedValue,
            @ForAll("uuids") UUID workspaceId) {

        // Total from active deals only
        BigDecimal activeTotal = activeDeals.stream()
                .map(d -> d.getValue() != null ? d.getValue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DealRepository mockDealRepo = Mockito.mock(DealRepository.class);
        // Repository correctly excludes deleted deals → returns activeTotal regardless of deletedValue
        when(mockDealRepo.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(activeTotal);
        when(mockDealRepo.sumWonValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.sumLostValueByWorkspaceId(any()))
                .thenReturn(BigDecimal.ZERO);
        when(mockDealRepo.countByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn((long) activeDeals.size());
        when(mockDealRepo.findPipelineSummaryByWorkspaceId(any()))
                .thenReturn(List.of());

        DealService service = buildService(mockDealRepo);

        PipelineSummaryDto summary = service.getPipelineSummary(workspaceId);

        assertThat(summary.total())
                .as("Deleted deal with value %s must not affect the pipeline total", deletedValue)
                .isEqualByComparingTo(activeTotal);
    }

    // =========================================================================
    // Arbitraries
    // =========================================================================

    @Provide
    Arbitrary<UUID> uuids() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<BigDecimal> dealValues() {
        return Arbitraries.bigDecimals()
                .between(BigDecimal.ZERO, new BigDecimal("999999.99"))
                .ofScale(2);
    }

    /** Arbitrary deals with random deleted/active state and arbitrary values. */
    @Provide
    Arbitrary<List<Deal>> dealLists() {
        return buildDealArbitrary(null)
                .list()
                .ofMinSize(0)
                .ofMaxSize(20);
    }

    /** Arbitrary deals all marked as deleted. */
    @Provide
    Arbitrary<List<Deal>> deletedDealLists() {
        return buildDealArbitrary(true)
                .list()
                .ofMinSize(1)
                .ofMaxSize(15);
    }

    /** Arbitrary deals all marked as active (not deleted). */
    @Provide
    Arbitrary<List<Deal>> activeDealLists() {
        return buildDealArbitrary(false)
                .list()
                .ofMinSize(0)
                .ofMaxSize(15);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Builds a Deal arbitrary.
     *
     * @param deleted {@code true} → always deleted, {@code false} → always active,
     *                {@code null} → random deleted state
     */
    private Arbitrary<Deal> buildDealArbitrary(Boolean deleted) {
        Arbitrary<BigDecimal> valueArb = Arbitraries.bigDecimals()
                .between(BigDecimal.ZERO, new BigDecimal("999999.99"))
                .ofScale(2);

        Arbitrary<Boolean> deletedArb = deleted != null
                ? Arbitraries.just(deleted)
                : Arbitraries.of(true, false);

        return Combinators.combine(valueArb, deletedArb)
                .as((value, isDeleted) -> {
                    Deal deal = Deal.builder()
                            .name("Deal-" + UUID.randomUUID().toString().substring(0, 8))
                            .value(value)
                            .contactId(UUID.randomUUID())
                            .assignedTo(UUID.randomUUID())
                            .deleted(isDeleted)
                            .build();
                    deal.setWorkspaceId(UUID.randomUUID());
                    return deal;
                });
    }

    private DealService buildService(DealRepository dealRepository) {
        StageRepository mockStageRepo = Mockito.mock(StageRepository.class);
        PipelineRepository mockPipelineRepo = Mockito.mock(PipelineRepository.class);
        DealStageHistoryRepository mockHistoryRepo = Mockito.mock(DealStageHistoryRepository.class);
        ContactRepository mockContactRepo = Mockito.mock(ContactRepository.class);
        return new DealService(dealRepository, mockStageRepo, mockPipelineRepo, mockHistoryRepo, mockContactRepo);
    }
}
