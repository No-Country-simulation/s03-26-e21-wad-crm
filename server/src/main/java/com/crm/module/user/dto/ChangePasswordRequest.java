package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ChangePasswordRequest(
    @NotBlank String currentPassword,
    @NotBlank @Size(min = 8, message = "New password must be at least 8 characters") String newPassword
) {}
