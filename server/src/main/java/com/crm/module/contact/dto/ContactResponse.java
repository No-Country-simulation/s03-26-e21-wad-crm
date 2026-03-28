package com.crm.module.contact.dto;

import com.crm.module.contact.entity.ContactStatus;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record ContactResponse(

        UUID id,
        String name,
        String email,
        String phone,
        String jobTitle,
        ContactStatus status,
        UUID workspaceId,

        CompanyInfo company,
        UserInfo assignedTo,
        Set<TagResponse> tags,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record CompanyInfo(UUID id, String name) {}
    public record UserInfo(UUID id, String name, String email) {}
}
