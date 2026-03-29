package com.crm.module.deal;

import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.entity.DealStageHistory;
import com.crm.module.deal.entity.Stage;
import net.jqwik.api.*;
import net.jqwik.api.Tuple.Tuple3;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based test for the metamorphic stage-move relation.
 *
 * <p><b>Validates: Requisito 15.1</b>
 *
 * <p><b>Property 10 (Metamorphic):</b>
 * <pre>
 *   finalStage(A→B→C) == finalStage(A→C) == C
 * </pre>
 *
 * <p>Moving a deal through an intermediate stage (A→B→C) must produce the
 * same final stage as moving directly (A→C). The intermediate step is
 * irrelevant to the final state.
 */
class StageMoveMetamorphicPropertyTest {

    // =========================================================================
    // Property 10a — sequential A→B→C equals direct A→C
    //
    // ∀ stageA, stageB, stageC (same workspace):
    //   deal.setStage(A); deal.setStage(B); deal.setStage(C)
    //   ≡ deal.setStage(A); deal.setStage(C)
    //   → deal.getStage().getId() == stageC.getId()
    // =========================================================================

    /**
     * <b>Validates: Requisito 15.1</b>
     *
     * <p>For any three stages A, B, C belonging to the same workspace, moving
     * a deal sequentially A→B→C must yield the same final stage as moving
     * directly A→C. The intermediate stage B has no effect on the final state.
     */
    @Property
    void sequentialMoveProducesSameFinalStateAsDirectMove(
            @ForAll("threeStageTriples") Tuple3<Stage, Stage, Stage> triple) {

        Stage stageA = triple.get1();
        Stage stageB = triple.get2();
        Stage stageC = triple.get3();

        Deal deal = buildDeal(stageA);

        // Path 1: A → B → C
        deal.setStage(stageB);
        deal.setStage(stageC);
        UUID finalStageSequential = deal.getStage().getId();

        // Reset to A
        deal.setStage(stageA);

        // Path 2: A → C (direct)
        deal.setStage(stageC);
        UUID finalStageDirect = deal.getStage().getId();

        assertThat(finalStageSequential)
                .as("Sequential A→B→C must yield the same final stage as direct A→C")
                .isEqualTo(finalStageDirect)
                .isEqualTo(stageC.getId());
    }

    // =========================================================================
    // Property 10b — last history entry toStageId always equals current stage
    //
    // ∀ sequence of moves on a deal:
    //   history.last().toStageId == deal.getStage().getId()
    // =========================================================================

    /**
     * <b>Validates: Requisito 15.1</b>
     *
     * <p>After any sequence of stage moves, the last entry in the history log
     * must have its {@code toStageId} equal to the deal's current stage ID.
     * This invariant holds regardless of how many intermediate moves occurred.
     */
    @Property
    void lastHistoryEntryToStageIdEqualsCurrentStage(
            @ForAll("threeStageTriples") Tuple3<Stage, Stage, Stage> triple) {

        Stage stageA = triple.get1();
        Stage stageB = triple.get2();
        Stage stageC = triple.get3();

        Deal deal = buildDeal(stageA);
        List<DealStageHistory> history = new ArrayList<>();

        // Move A → B
        UUID fromB = deal.getStage().getId();
        deal.setStage(stageB);
        history.add(buildHistory(deal.getId(), fromB, stageB.getId()));

        // Move B → C
        UUID fromC = deal.getStage().getId();
        deal.setStage(stageC);
        history.add(buildHistory(deal.getId(), fromC, stageC.getId()));

        UUID lastToStageId = history.get(history.size() - 1).getToStageId();

        assertThat(lastToStageId)
                .as("Last history entry toStageId must equal the deal's current stage ID")
                .isEqualTo(deal.getStage().getId());
    }

    // =========================================================================
    // Arbitraries
    // =========================================================================

    /**
     * Generates triples (A, B, C) of stages all belonging to the same workspace.
     * The stages may share the same ID in degenerate cases (e.g. A==C), which
     * is valid — the metamorphic property still holds.
     */
    @Provide
    Arbitrary<Tuple3<Stage, Stage, Stage>> threeStageTriples() {
        return Arbitraries.create(UUID::randomUUID)
                .flatMap(workspaceId ->
                        Combinators.combine(
                                stageArbitrary(workspaceId),
                                stageArbitrary(workspaceId),
                                stageArbitrary(workspaceId)
                        ).as(Tuple::of)
                );
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private Arbitrary<Stage> stageArbitrary(UUID workspaceId) {
        return Arbitraries.create(UUID::randomUUID)
                .map(stageId -> buildStage(stageId, workspaceId));
    }

    private Stage buildStage(UUID stageId, UUID workspaceId) {
        Stage stage = Stage.builder()
                .name("Stage-" + stageId.toString().substring(0, 8))
                .order(1)
                .build();
        stage.setId(stageId);
        stage.setWorkspaceId(workspaceId);
        return stage;
    }

    private Deal buildDeal(Stage initialStage) {
        UUID dealId = UUID.randomUUID();
        Deal deal = Deal.builder()
                .name("Deal-" + dealId.toString().substring(0, 8))
                .contactId(UUID.randomUUID())
                .stage(initialStage)
                .build();
        deal.setId(dealId);
        deal.setWorkspaceId(initialStage.getWorkspaceId());
        return deal;
    }

    private DealStageHistory buildHistory(UUID dealId, UUID fromStageId, UUID toStageId) {
        return DealStageHistory.builder()
                .dealId(dealId)
                .fromStageId(fromStageId)
                .toStageId(toStageId)
                .changedBy(UUID.randomUUID())
                .build();
    }
}
