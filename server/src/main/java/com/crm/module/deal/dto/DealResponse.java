package com.crm.module.deal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/** Req 17.3 */
public record DealResponse(
        UUID id,
        String name,
        BigDecimal value,
        UUID contactId,
        UUID assignedTo,
        UUID workspaceId,
        StageInfo stage,
        boolean deleted,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record StageInfo(UUID id, String name, boolean isWon, boolean isLost) {}
}
