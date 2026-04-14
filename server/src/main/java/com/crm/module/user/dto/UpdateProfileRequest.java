package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateProfileRequest(
    String name,
    String phone,
    String timezone
) {}
