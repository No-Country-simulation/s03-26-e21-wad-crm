package com.crm.module.user.dto;

import com.crm.module.user.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class InviteUserRequest {

    @NotBlank
    @Email
    String email;

    @NotBlank
    String name;

    UserRole role;
}
