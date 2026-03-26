package com.crm.module.user.dto;

import com.crm.module.user.entity.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UpdateRoleRequest {

    @NotNull
    UserRole role;
}
