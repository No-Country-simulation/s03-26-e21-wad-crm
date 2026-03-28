package com.crm.module.contact.dto;

import jakarta.validation.constraints.NotBlank;

public record TagRequest(
        @NotBlank String name,
        String color
) {}
