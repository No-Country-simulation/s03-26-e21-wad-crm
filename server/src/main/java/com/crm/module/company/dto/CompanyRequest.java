package com.crm.module.company.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(

        @NotBlank(message = "Name is required")
        String name,

        String domain,

        String industry
) {}
