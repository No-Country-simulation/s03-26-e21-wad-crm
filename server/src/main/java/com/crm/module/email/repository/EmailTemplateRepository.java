package com.crm.module.email.repository;

import com.crm.module.email.entity.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, UUID> {


    @Query("SELECT t FROM EmailTemplate t WHERE t.workspaceId = :workspaceId AND t.active = true ORDER BY t.name ASC")
    List<EmailTemplate> findByWorkspaceIdAndActiveTrueOrderByNameAsc(@Param("workspaceId") UUID workspaceId);

    Optional<EmailTemplate> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    boolean existsByWorkspaceIdAndName(UUID workspaceId, String name);

    @Query("SELECT t FROM EmailTemplate t WHERE t.workspaceId = :workspaceId AND t.defaultTemplate = true")
    Optional<EmailTemplate> findByWorkspaceIdAndDefaultTemplateTrue(@Param("workspaceId") UUID workspaceId);

    List<EmailTemplate> findByWorkspaceIdAndCategory(UUID workspaceId, EmailTemplate.TemplateCategory category);
}
