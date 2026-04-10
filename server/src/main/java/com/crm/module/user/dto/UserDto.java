package com.crm.module.user.dto;

import com.crm.module.user.entity.User;
import com.crm.module.user.entity.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class UserDto {

    UUID id;
    String email;
    String name;
    String phone;
    String timezone;
    Role role;
    boolean isActive;
    UUID workspaceId;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime updatedAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .timezone(user.getTimezone())
                .role(user.getRole())
                .isActive(user.isActive())
                .workspaceId(user.getWorkspaceId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
