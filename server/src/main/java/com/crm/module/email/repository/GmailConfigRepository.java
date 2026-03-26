package com.crm.module.email.repository;

import com.crm.module.email.entity.GmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GmailConfigRepository extends JpaRepository<GmailConfig, UUID> {

    Optional<GmailConfig> findByWorkspaceIdAndIsActiveTrue(UUID workspaceId);
}
