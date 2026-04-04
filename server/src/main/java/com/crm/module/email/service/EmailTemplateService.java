package com.crm.module.email.service;

import com.crm.common.exception.ConflictException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.module.email.dto.CreateEmailTemplateRequest;
import com.crm.module.email.dto.EmailTemplateDto;
import com.crm.module.email.dto.UpdateEmailTemplateRequest;
import com.crm.module.email.entity.EmailTemplate;
import com.crm.module.email.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public List<EmailTemplateDto> getAllTemplates(UUID workspaceId) {
        return templateRepository.findByWorkspaceIdAndActiveTrueOrderByNameAsc(workspaceId)
                .stream()
                .map(EmailTemplateDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmailTemplateDto getTemplateById(UUID workspaceId, UUID templateId) {
        EmailTemplate template = findTemplateOrThrow(workspaceId, templateId);
        return EmailTemplateDto.fromEntity(template);
    }

    @Transactional(readOnly = true)
    public List<EmailTemplateDto> getTemplatesByCategory(UUID workspaceId, EmailTemplate.TemplateCategory category) {
        return templateRepository.findByWorkspaceIdAndCategory(workspaceId, category)
                .stream()
                .map(EmailTemplateDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmailTemplateDto createTemplate(UUID workspaceId, CreateEmailTemplateRequest request) {
        if (templateRepository.existsByWorkspaceIdAndName(workspaceId, request.getName())) {
            throw new ConflictException("Template with name '" + request.getName() + "' already exists");
        }

        EmailTemplate template = EmailTemplate.builder()
                .name(request.getName())
                .subject(request.getSubject())
                .body(request.getBody())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : EmailTemplate.TemplateCategory.CUSTOM)
                .active(request.getIsActive() != null ? request.getIsActive() : true)
                .defaultTemplate(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();
        template.setWorkspaceId(workspaceId);

        if (request.getIsDefault() != null && request.getIsDefault()) {
            clearDefaultFlag(workspaceId);
        }

        template = templateRepository.save(template);
        log.info("Created email template '{}' for workspace {}", template.getName(), workspaceId);
        return EmailTemplateDto.fromEntity(template);
    }

    @Transactional
    public EmailTemplateDto updateTemplate(UUID workspaceId, UUID templateId, UpdateEmailTemplateRequest request) {
        EmailTemplate template = findTemplateOrThrow(workspaceId, templateId);

        if (request.getName() != null && !request.getName().equals(template.getName())) {
            if (templateRepository.existsByWorkspaceIdAndName(workspaceId, request.getName())) {
                throw new ConflictException("Template with name '" + request.getName() + "' already exists");
            }
            template.setName(request.getName());
        }

        if (request.getSubject() != null) template.setSubject(request.getSubject());
        if (request.getBody() != null) template.setBody(request.getBody());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getCategory() != null) template.setCategory(request.getCategory());


        if (request.getIsActive() != null) {
            template.setActive(request.getIsActive());
        }

        if (request.getIsDefault() != null && request.getIsDefault() && !template.isDefaultTemplate()) {
            clearDefaultFlag(workspaceId);
            template.setDefaultTemplate(true);
        }

        template = templateRepository.save(template);
        log.info("Updated email template '{}' for workspace {}", template.getName(), workspaceId);
        return EmailTemplateDto.fromEntity(template);
    }

    @Transactional
    public void deleteTemplate(UUID workspaceId, UUID templateId) {
        EmailTemplate template = findTemplateOrThrow(workspaceId, templateId);
        template.setActive(false);
        templateRepository.save(template);
        log.info("Deleted (deactivated) email template '{}' for workspace {}", template.getName(), workspaceId);
    }

    @Transactional(readOnly = true)
    public EmailTemplateDto getDefaultTemplate(UUID workspaceId) {
        EmailTemplate template = templateRepository.findByWorkspaceIdAndDefaultTemplateTrue(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("No default template found"));
        return EmailTemplateDto.fromEntity(template);
    }

    @Transactional(readOnly = true)
    public String previewTemplate(UUID workspaceId, UUID templateId, UUID contactId) {
        EmailTemplate template = findTemplateOrThrow(workspaceId, templateId);
        return template.getBody();
    }

    private EmailTemplate findTemplateOrThrow(UUID workspaceId, UUID templateId) {
        return templateRepository.findByIdAndWorkspaceId(templateId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found"));
    }

    private void clearDefaultFlag(UUID workspaceId) {
        templateRepository.findByWorkspaceIdAndDefaultTemplateTrue(workspaceId)
                .ifPresent(defaultTemplate -> {
                    defaultTemplate.setDefaultTemplate(false);
                    templateRepository.save(defaultTemplate);
                });
    }
}
