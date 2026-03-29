package com.crm.module.deal.repository;

import com.crm.module.deal.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StageRepository extends JpaRepository<Stage, UUID> {

    List<Stage> findByWorkspaceIdOrderByOrderAsc(UUID workspaceId);

    Optional<Stage> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    Optional<Stage> findFirstByPipelineIdAndWorkspaceIdOrderByOrderAsc(UUID pipelineId, UUID workspaceId);
}
