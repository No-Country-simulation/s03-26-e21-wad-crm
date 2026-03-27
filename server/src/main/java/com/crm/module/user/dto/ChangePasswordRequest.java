package com.crm.module.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Value;

@Value
public class ChangePasswordRequest {

    @NotBlank
    String currentPassword;

    @NotBlank
    @Size(min = 8, message = "New password must be at least 8 characters")
    String newPassword;
}
