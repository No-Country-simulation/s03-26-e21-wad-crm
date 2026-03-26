package com.crm.module.contact.repository;

import com.crm.module.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    Optional<Contact> findByWorkspaceIdAndIdAndDeletedFalse(UUID workspaceId, UUID id);

    Optional<Contact> findByWorkspaceIdAndEmailAndDeletedFalse(UUID workspaceId, String email);
}
