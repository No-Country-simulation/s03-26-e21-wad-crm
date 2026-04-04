package com.crm.module.email.dto;

import com.crm.module.email.entity.EmailTemplate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmailTemplateRequest {

    private String name;

    private String subject;

    private String body;

    private String description;

    private EmailTemplate.TemplateCategory category;

    private Boolean isActive;

    private Boolean isDefault;
}
