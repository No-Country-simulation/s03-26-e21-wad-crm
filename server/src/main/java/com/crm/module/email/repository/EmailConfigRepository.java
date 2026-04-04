package com.crm.module.email.repository;

import com.crm.module.email.entity.EmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailConfigRepository extends JpaRepository<EmailConfig, UUID> {

    Optional<EmailConfig> findByWorkspaceIdAndIsActiveTrue(UUID workspaceId);

    List<EmailConfig> findAllByIsActiveTrue();
}