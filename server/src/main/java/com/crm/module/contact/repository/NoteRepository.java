package com.crm.module.contact.repository;

import com.crm.module.contact.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findByContactIdOrderByCreatedAtDesc(UUID contactId);
}
