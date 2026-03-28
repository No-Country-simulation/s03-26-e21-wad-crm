package com.crm.module.contact.dto;

import java.util.UUID;

public record TagResponse(
        UUID id,
        String name,
        String color
) {}
