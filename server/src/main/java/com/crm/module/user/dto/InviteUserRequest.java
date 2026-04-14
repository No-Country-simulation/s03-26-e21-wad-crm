package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Value;

@Value
public class InviteUserRequest {

    @JsonCreator
    public InviteUserRequest(@NotBlank @Email String email, @NotBlank String name, String role) {
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getRole() { return role; }
}
