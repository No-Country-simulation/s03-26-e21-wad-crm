package com.crm.module.deal.repository;

import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.dto.PipelineStageSummaryDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID>, JpaSpecificationExecutor<Deal> {

    long countByWorkspaceIdAndDeletedFalse(UUID workspaceId);

    long countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(UUID workspaceId, LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false")
    BigDecimal sumValueByWorkspaceIdAndDeletedFalse(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false AND d.stage.isWon = true AND d.createdAt > :startDate")
    long countWonDealsByWorkspaceIdAndCreatedAtAfter(@Param("workspaceId") UUID workspaceId, @Param("startDate") LocalDateTime startDate);

    /**
     * Agrega deals activos por etapa: count + suma de valores.
     * Req 17.2, 18.2
     */
    @Query("""
            SELECT new com.crm.module.deal.dto.PipelineStageSummaryDto(
                s.id, s.name, COUNT(d), COALESCE(SUM(d.value), 0), s.isWon, s.isLost)
            FROM Deal d
            JOIN d.stage s
            WHERE d.workspaceId = :workspaceId AND d.deleted = false
            GROUP BY s.id, s.name, s.isWon, s.isLost, s.position
            ORDER BY s.position ASC
            """)
    List<PipelineStageSummaryDto> findPipelineSummaryByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Suma de deals activos en etapas isWon=true. Req 18.3
     */
    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false AND d.stage.isWon = true")
    BigDecimal sumWonValueByWorkspaceId(@Param("workspaceId") UUID workspaceId);

    /**
     * Suma de deals activos en etapas isLost=true. Req 18.3
     */
    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false AND d.stage.isLost = true")
    BigDecimal sumLostValueByWorkspaceId(@Param("workspaceId") UUID workspaceId);
}
