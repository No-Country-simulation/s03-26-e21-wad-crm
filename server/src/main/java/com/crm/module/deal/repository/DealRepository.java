package com.crm.module.deal.repository;

import com.crm.module.deal.entity.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID>, JpaSpecificationExecutor<Deal> {

    long countByWorkspaceIdAndDeletedFalse(UUID workspaceId);

    long countByWorkspaceIdAndDeletedFalseAndCreatedAtAfter(UUID workspaceId, LocalDateTime startDate);

    @Query("SELECT COALESCE(SUM(d.value), 0) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false")
    BigDecimal sumValueByWorkspaceIdAndDeletedFalse(@Param("workspaceId") UUID workspaceId);

    @Query("SELECT COUNT(d) FROM Deal d WHERE d.workspaceId = :workspaceId AND d.deleted = false AND d.stage.isWon = true AND d.createdAt > :startDate")
    long countWonDealsByWorkspaceIdAndCreatedAtAfter(@Param("workspaceId") UUID workspaceId, @Param("startDate") LocalDateTime startDate);
}
