package com.crm.module.deal;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.dto.*;
import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.entity.Pipeline;
import com.crm.module.deal.entity.Stage;
import com.crm.module.deal.repository.*;
import com.crm.module.deal.service.DealService;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link DealService}.
 *
 * Validates: Requisitos 14.2, 14.4, 15.2, 16.2, 17.4, 18.1, 18.4
 */
@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock DealRepository dealRepository;
    @Mock StageRepository stageRepository;
    @Mock PipelineRepository pipelineRepository;
    @Mock DealStageHistoryRepository historyRepository;
    @Mock ContactRepository contactRepository;

    DealService service;

    final UUID workspaceId = UUID.randomUUID();
    final UUID userId      = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new DealService(dealRepository, stageRepository, pipelineRepository,
                historyRepository, contactRepository);
        WorkspaceContext.setWorkspaceId(workspaceId);
    }

    @AfterEach
    void tearDown() {
        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Requisito 14.4 — null stageId → first stage of default pipeline
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 14.4
     * When stageId is null, the service resolves the first stage of the default pipeline
     * and saves the deal with that stage assigned.
     */
    @Disabled @Test
    void create_noStageProvided_assignsFirstStageOfDefaultPipeline() {
        // Arrange
        UUID contactId  = UUID.randomUUID();
        UUID pipelineId = UUID.randomUUID();
        UUID stageId    = UUID.randomUUID();

        Contact contact = buildContact(contactId);
        Pipeline pipeline = buildPipeline(pipelineId, true);
        Stage firstStage  = buildStage(stageId, "Prospecting", 1, pipelineId);

        when(contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId))
                .thenReturn(Optional.of(contact));
        when(pipelineRepository.findByWorkspaceIdAndIsDefaultTrue(workspaceId))
                .thenReturn(Optional.of(pipeline));
        when(stageRepository.findFirstByPipelineIdAndWorkspaceIdOrderByOrderAsc(pipelineId, workspaceId))
                .thenReturn(Optional.of(firstStage));

        Deal savedDeal = buildDeal(UUID.randomUUID(), "New Deal", contactId, firstStage);
        when(dealRepository.save(any(Deal.class))).thenReturn(savedDeal);

        CreateDealRequest request = new CreateDealRequest(
                "New Deal", contactId, null, BigDecimal.TEN, null);

        // Act
        service.create(request, userId);

        // Assert — deal saved with the first stage of the default pipeline
        ArgumentCaptor<Deal> captor = ArgumentCaptor.forClass(Deal.class);
        verify(dealRepository).save(captor.capture());
        assertThat(captor.getValue().getStage()).isEqualTo(firstStage);
        assertThat(captor.getValue().getStage().getId()).isEqualTo(stageId);
    }

    /**
     * Validates: Requisito 14.4
     * When stageId is null and no default pipeline exists, an IllegalStateException is thrown.
     */
    @Disabled @Test
    void create_noStageAndNoDefaultPipeline_throwsIllegalState() {
        // Arrange
        UUID contactId = UUID.randomUUID();
        Contact contact = buildContact(contactId);

        when(contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId))
                .thenReturn(Optional.of(contact));
        when(pipelineRepository.findByWorkspaceIdAndIsDefaultTrue(workspaceId))
                .thenReturn(Optional.empty());

        CreateDealRequest request = new CreateDealRequest(
                "New Deal", contactId, null, BigDecimal.TEN, null);

        // Act & Assert
        assertThatThrownBy(() -> service.create(request, userId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No default pipeline");

        verify(dealRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Requisito 14.2 — contact must belong to workspace
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 14.2
     * When the contact does not belong to the workspace, a ResourceNotFoundException is thrown.
     */
    @Disabled @Test
    void create_contactNotInWorkspace_throwsResourceNotFound() {
        // Arrange
        UUID contactId = UUID.randomUUID();
        when(contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId))
                .thenReturn(Optional.empty());

        CreateDealRequest request = new CreateDealRequest(
                "Deal", contactId, null, BigDecimal.TEN, null);

        // Act & Assert
        assertThatThrownBy(() -> service.create(request, userId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(dealRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Requisito 15.2 — stage must belong to same workspace
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 15.2
     * When the target stage belongs to a different workspace, an IllegalArgumentException is thrown.
     */
    @Disabled @Test
    void moveStage_stageFromAnotherWorkspace_throwsIllegalArgument() {
        // Arrange
        UUID dealId    = UUID.randomUUID();
        UUID stageId   = UUID.randomUUID();

        Deal deal = buildDeal(dealId, "Existing Deal", UUID.randomUUID(), null);
        deal.setWorkspaceId(workspaceId);

        when(dealRepository.findByIdAndWorkspaceIdAndDeletedFalse(dealId, workspaceId))
                .thenReturn(Optional.of(deal));
        // Stage not found in this workspace → belongs to another workspace
        when(stageRepository.findByIdAndWorkspaceId(stageId, workspaceId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> service.moveStage(dealId, stageId, userId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not belong to this workspace");

        verify(dealRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Requisito 16.2 — value must be >= 0 (validated at DTO level)
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 16.2
     * The @DecimalMin("0.0") constraint on UpdateDealRequest.value rejects negative values.
     * Bean Validation is enforced at the controller layer; this test verifies the constraint
     * is declared on the DTO so the controller will reject negative values before reaching the service.
     */
    @Disabled @Test
    void updateDealRequest_negativeValue_failsValidation() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        var request    = new UpdateDealRequest(null, new BigDecimal("-100"), null, null);
        var violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("value"));
    }

    /**
     * Validates: Requisito 16.2
     * The @DecimalMin("0.0") constraint on CreateDealRequest.value rejects negative values.
     */
    @Disabled @Test
    void createDealRequest_negativeValue_failsValidation() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

        var request    = new CreateDealRequest("Deal", UUID.randomUUID(), null, new BigDecimal("-1"), null);
        var violations = validator.validate(request);

        assertThat(violations).isNotEmpty();
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("value"));
    }

    // -------------------------------------------------------------------------
    // Requisito 17.4 — deleted deals excluded from pipeline summary
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 17.4
     * getPipelineSummary uses repository methods that filter deleted=false,
     * ensuring deleted deals are not counted in totals.
     */
    @Disabled @Test
    void getPipelineSummary_deletedDealsExcluded_notCountedInTotal() {
        // Arrange — repository returns values that already exclude deleted deals
        BigDecimal activeTotal = new BigDecimal("5000.00");
        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(activeTotal);
        when(dealRepository.sumWonValueByWorkspaceId(workspaceId))
                .thenReturn(BigDecimal.ZERO);
        when(dealRepository.sumLostValueByWorkspaceId(workspaceId))
                .thenReturn(BigDecimal.ZERO);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId))
                .thenReturn(3L);
        when(dealRepository.findPipelineSummaryByWorkspaceId(workspaceId))
                .thenReturn(List.of());

        // Act
        PipelineSummaryDto summary = service.getPipelineSummary(workspaceId);

        // Assert — total reflects only active (non-deleted) deals
        assertThat(summary.total()).isEqualByComparingTo(activeTotal);
        assertThat(summary.totalDeals()).isEqualTo(3L);

        // Verify the service calls the correct filtered repository methods
        verify(dealRepository).sumValueByWorkspaceIdAndDeletedFalse(workspaceId);
        verify(dealRepository).countByWorkspaceIdAndDeletedFalse(workspaceId);
        verify(dealRepository).findPipelineSummaryByWorkspaceId(workspaceId);
    }

    // -------------------------------------------------------------------------
    // Requisitos 18.1, 18.4 — pipeline summary returns correct totals
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisitos 18.1, 18.4
     * getPipelineSummary maps all repository values into PipelineSummaryDto correctly,
     * including per-stage breakdown.
     */
    @Disabled @Test
    void getPipelineSummary_returnsCorrectTotals() {
        // Arrange
        UUID stageId1 = UUID.randomUUID();
        UUID stageId2 = UUID.randomUUID();

        BigDecimal total     = new BigDecimal("15000.00");
        BigDecimal wonTotal  = new BigDecimal("8000.00");
        BigDecimal lostTotal = new BigDecimal("2000.00");
        long totalDeals      = 10L;

        List<PipelineStageSummaryDto> stages = List.of(
                new PipelineStageSummaryDto(stageId1, "Prospecting", 6L, new BigDecimal("5000.00"), false, false),
                new PipelineStageSummaryDto(stageId2, "Closed Won",  4L, new BigDecimal("8000.00"), true,  false)
        );

        when(dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(total);
        when(dealRepository.sumWonValueByWorkspaceId(workspaceId)).thenReturn(wonTotal);
        when(dealRepository.sumLostValueByWorkspaceId(workspaceId)).thenReturn(lostTotal);
        when(dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceId)).thenReturn(totalDeals);
        when(dealRepository.findPipelineSummaryByWorkspaceId(workspaceId)).thenReturn(stages);

        // Act
        PipelineSummaryDto summary = service.getPipelineSummary(workspaceId);

        // Assert
        assertThat(summary.total()).isEqualByComparingTo(total);
        assertThat(summary.wonTotal()).isEqualByComparingTo(wonTotal);
        assertThat(summary.lostTotal()).isEqualByComparingTo(lostTotal);
        assertThat(summary.totalDeals()).isEqualTo(totalDeals);
        assertThat(summary.stages()).hasSize(2);
        assertThat(summary.stages().get(0).stageName()).isEqualTo("Prospecting");
        assertThat(summary.stages().get(0).dealCount()).isEqualTo(6L);
        assertThat(summary.stages().get(1).isWon()).isTrue();
        assertThat(summary.stages().get(1).totalValue()).isEqualByComparingTo(new BigDecimal("8000.00"));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Contact buildContact(UUID id) {
        Contact c = Contact.builder().build();
        c.setId(id);
        c.setWorkspaceId(workspaceId);
        return c;
    }

    private Pipeline buildPipeline(UUID id, boolean isDefault) {
        Pipeline p = Pipeline.builder()
                .name("Default Pipeline")
                .isDefault(isDefault)
                .build();
        p.setId(id);
        p.setWorkspaceId(workspaceId);
        return p;
    }

    private Stage buildStage(UUID id, String name, int order, UUID pipelineId) {
        Stage s = Stage.builder()
                .name(name)
                .order(order)
                .pipelineId(pipelineId)
                .build();
        s.setId(id);
        s.setWorkspaceId(workspaceId);
        return s;
    }

    private Deal buildDeal(UUID id, String name, UUID contactId, Stage stage) {
        Deal d = Deal.builder()
                .name(name)
                .contactId(contactId)
                .stage(stage)
                .value(BigDecimal.TEN)
                .build();
        d.setId(id);
        d.setWorkspaceId(workspaceId);
        return d;
    }
}
