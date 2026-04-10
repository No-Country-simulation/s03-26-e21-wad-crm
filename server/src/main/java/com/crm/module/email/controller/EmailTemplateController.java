package com.crm.module.email.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.email.dto.CreateEmailTemplateRequest;
import com.crm.module.email.dto.EmailTemplateDto;
import com.crm.module.email.dto.UpdateEmailTemplateRequest;
import com.crm.module.email.entity.EmailTemplate;
import com.crm.module.email.service.EmailTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/email/templates")
@RequiredArgsConstructor
public class EmailTemplateController {

    private final EmailTemplateService templateService;

    @GetMapping
    public ResponseEntity<List<EmailTemplateDto>> getAllTemplates() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.getAllTemplates(workspaceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplateDto> getTemplateById(@PathVariable UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.getTemplateById(workspaceId, id));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<EmailTemplateDto>> getTemplatesByCategory(@PathVariable EmailTemplate.TemplateCategory category) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.getTemplatesByCategory(workspaceId, category));
    }

    @GetMapping("/default")
    public ResponseEntity<EmailTemplateDto> getDefaultTemplate() {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.getDefaultTemplate(workspaceId));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<String> previewTemplate(@PathVariable UUID id,
                                                  @RequestParam(required = false) UUID contactId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.previewTemplate(workspaceId, id, contactId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailTemplateDto> createTemplate(@Valid @RequestBody CreateEmailTemplateRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateService.createTemplate(workspaceId, request));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmailTemplateDto> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmailTemplateRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        return ResponseEntity.ok(templateService.updateTemplate(workspaceId, id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        templateService.deleteTemplate(workspaceId, id);
        return ResponseEntity.noContent().build();
    }
}
