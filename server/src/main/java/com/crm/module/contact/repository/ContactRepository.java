package com.crm.module.contact.repository;

import com.crm.module.contact.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID>,
        JpaSpecificationExecutor<Contact> {

    Page<Contact> findByWorkspaceIdAndIsDeletedFalse(UUID workspaceId, Pageable pageable);

    Optional<Contact> findByIdAndWorkspaceId(UUID id, UUID workspaceId);

    Optional<Contact> findByWorkspaceIdAndIdAndIsDeletedFalse(UUID workspaceId, UUID id);

    boolean existsByEmailAndWorkspaceIdAndIsDeletedFalse(String email, UUID workspaceId);

    boolean existsByEmailAndWorkspaceIdAndIdNotAndIsDeletedFalse(
            String email, UUID workspaceId, UUID excludeId);

    // Used by WhatsAppWebhookService (req 20.2)
    Optional<Contact> findByWorkspaceIdAndPhoneAndIsDeletedFalse(UUID workspaceId, String phone);

    // Used by EmailService (req 26.3)
    Optional<Contact> findByWorkspaceIdAndEmailAndIsDeletedFalse(UUID workspaceId, String email);

    // Used by EmailController — alias matching old branch naming
    default Optional<Contact> findByWorkspaceIdAndIdAndDeletedFalse(UUID workspaceId, UUID id) {
        return findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, id);
    }

    // Bridge aliases used by other modules that use the old naming convention
    default Optional<Contact> findByWorkspaceIdAndPhoneAndDeletedFalse(UUID workspaceId, String phone) {
        return findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, phone);
    }

    default Optional<Contact> findByWorkspaceIdAndEmailAndDeletedFalse(UUID workspaceId, String email) {
        return findByWorkspaceIdAndEmailAndIsDeletedFalse(workspaceId, email);
    }

    // Used by AnalyticsService (req 31.1)
    long countByWorkspaceIdAndIsDeletedFalse(UUID workspaceId);

    default long countByWorkspaceIdAndDeletedFalse(UUID workspaceId) {
        return countByWorkspaceIdAndIsDeletedFalse(workspaceId);
    }
}
