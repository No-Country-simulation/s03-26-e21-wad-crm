package com.crm.module.whatsapp.repository;

import com.crm.module.whatsapp.entity.WhatsAppConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WhatsAppConfigRepository extends JpaRepository<WhatsAppConfig, UUID> {

    Optional<WhatsAppConfig> findByWorkspaceIdAndActiveTrue(UUID workspaceId);

    /** Find all configs for a workspace (active or inactive). */
    List<WhatsAppConfig> findByWorkspaceId(UUID workspaceId);

    /** Find all configs for a phone number (active or inactive). */
    List<WhatsAppConfig> findByPhoneNumberId(String phoneNumberId);

    /** Req 20.1: resolver workspace a partir del phone_number_id del metadata del webhook. */
    Optional<WhatsAppConfig> findByPhoneNumberIdAndActiveTrue(String phoneNumberId);
}
