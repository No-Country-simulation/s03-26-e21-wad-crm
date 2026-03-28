package com.crm.module.contact.repository;

import com.crm.module.contact.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {

    List<Tag> findByWorkspaceId(UUID workspaceId);

    Optional<Tag> findByWorkspaceIdAndId(UUID workspaceId, UUID id);
}
