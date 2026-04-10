package com.crm.module.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UpdateRoleRequest {

    @NotNull
    String role;
}
