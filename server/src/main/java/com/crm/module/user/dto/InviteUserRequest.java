package com.crm.module.user.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record InviteUserRequest(
    @NotBlank @Email String email,
    @NotBlank String name,
    String role
) {}
