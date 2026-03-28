package com.crm.module.contact.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NoteResponse(
        UUID id,
        UUID contactId,
        String content,
        UUID createdBy,
        LocalDateTime createdAt
) {}
