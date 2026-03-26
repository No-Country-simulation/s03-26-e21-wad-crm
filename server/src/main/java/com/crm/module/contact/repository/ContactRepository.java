package com.crm.module.contact.repository;

import com.crm.module.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID>, JpaSpecificationExecutor<Contact> {

    Optional<Contact> findByWorkspaceIdAndIdAndDeletedFalse(UUID workspaceId, UUID id);

    Optional<Contact> findByWorkspaceIdAndEmailAndDeletedFalse(UUID workspaceId, String email);

    /** Req 20.2: identificar contacto por teléfono dentro del workspace. */
    Optional<Contact> findByWorkspaceIdAndPhoneAndDeletedFalse(UUID workspaceId, String phone);

    long countByWorkspaceIdAndDeletedFalse(UUID workspaceId);
}
