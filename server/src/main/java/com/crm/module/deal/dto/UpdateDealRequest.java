package com.crm.module.deal.dto;

import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.UUID;

/** Req 16.1–16.4 */
public record UpdateDealRequest(

        String name,

        @DecimalMin(value = "0.0", message = "Value must be >= 0")
        BigDecimal value,

        UUID assignedTo,

        UUID contactId
) {}
