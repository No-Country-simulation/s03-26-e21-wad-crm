package com.crm.module.email.dto;

import com.crm.module.email.entity.EmailTemplate;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmailTemplateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private String description;

    private EmailTemplate.TemplateCategory category;

    private Boolean isActive;

    private Boolean isDefault;
}
