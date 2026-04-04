package com.crm.module.email.dto;

import com.crm.module.email.entity.EmailTemplate;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateDto {

    private UUID id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private String description;

    private EmailTemplate.TemplateCategory category;

    // ✅ FIX: Alineado con los nuevos nombres del entity (active / defaultTemplate)
    private boolean active;

    private boolean defaultTemplate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static EmailTemplateDto fromEntity(EmailTemplate template) {
        return EmailTemplateDto.builder()
                .id(template.getId())
                .name(template.getName())
                .subject(template.getSubject())
                .body(template.getBody())
                .description(template.getDescription())
                .category(template.getCategory())
                .active(template.isActive())                       // ✅ isActive() generado por Lombok
                .defaultTemplate(template.isDefaultTemplate())     // ✅ isDefaultTemplate() generado por Lombok
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
