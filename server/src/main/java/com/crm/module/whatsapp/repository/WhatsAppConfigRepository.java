package com.crm.module.whatsapp.repository;

import com.crm.module.whatsapp.entity.WhatsAppConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WhatsAppConfigRepository extends JpaRepository<WhatsAppConfig, UUID> {

    Optional<WhatsAppConfig> findByWorkspaceIdAndActiveTrue(UUID workspaceId);
}
