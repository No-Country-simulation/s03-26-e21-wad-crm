package com.crm.module.deal.repository;

import com.crm.module.deal.entity.Pipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PipelineRepository extends JpaRepository<Pipeline, UUID> {

    Optional<Pipeline> findByWorkspaceIdAndIsDefaultTrue(UUID workspaceId);
}
