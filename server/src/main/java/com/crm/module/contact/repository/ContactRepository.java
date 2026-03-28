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
}
