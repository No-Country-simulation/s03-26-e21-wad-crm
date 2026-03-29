package com.crm.module.deal.repository;

import com.crm.module.deal.entity.DealStageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DealStageHistoryRepository extends JpaRepository<DealStageHistory, UUID> {

    List<DealStageHistory> findByDealIdOrderByChangedAtAsc(UUID dealId);
}
