package com.crm.module.deal.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Req 15.1 */
public record MoveStageRequest(

        @NotNull(message = "stageId is required")
        UUID stageId
) {}
