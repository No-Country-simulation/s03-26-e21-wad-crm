package com.crm.module.company.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CompanyResponse(

        UUID id,
        String name,
        String domain,
        String industry,
        UUID workspaceId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
