package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.NotNull;
import lombok.Value;

@Value
public class UpdateRoleRequest {

    @JsonCreator
    public UpdateRoleRequest(@NotNull String role) {
        this.role = role;
    }

    public String getRole() { return role; }
}
