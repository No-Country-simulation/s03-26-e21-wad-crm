package com.crm.module.deal.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/** Req 14.1–14.4 */
public record CreateDealRequest(

        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "contactId is required")
        UUID contactId,

        /** Null → assign first stage of workspace pipeline. Req 14.4 */
        UUID stageId,

        @DecimalMin(value = "0.0", message = "Value must be >= 0")
        BigDecimal value,

        UUID assignedTo
) {}
