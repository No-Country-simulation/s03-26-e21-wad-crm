package com.crm.module.export.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.export.dto.ContactExportFilter;
import com.crm.module.export.dto.DealExportFilter;
import com.crm.module.export.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/api/contacts/export")
    public ResponseEntity<byte[]> exportContacts(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(required = false) List<UUID> tagIds,
            @RequestParam(required = false) UUID assignedTo) {

        ContactExportFilter filter = new ContactExportFilter(search, status, tagIds, assignedTo);

        return switch (format.toLowerCase()) {
            case "csv" -> {
                byte[] data = exportService.exportContactsCsv(WorkspaceContext.getWorkspaceId(), filter);
                yield ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"contacts.csv\"")
                        .contentType(MediaType.parseMediaType("text/csv"))
                        .body(data);
            }
            case "pdf" -> {
                byte[] data = exportService.exportContactsPdf(WorkspaceContext.getWorkspaceId(), filter);
                yield ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"contacts.pdf\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .body(data);
            }
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Formato no soportado: '" + format + "'. Use 'csv' o 'pdf'.");
        };
    }

    @GetMapping("/api/deals/export")
    public ResponseEntity<byte[]> exportDeals(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID stageId,
            @RequestParam(required = false) UUID assignedTo) {

        if (!"csv".equalsIgnoreCase(format)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Formato no soportado para deals: '" + format + "'. Use 'csv'.");
        }

        DealExportFilter filter = new DealExportFilter(search, stageId, assignedTo);
        byte[] data = exportService.exportDealsCsv(WorkspaceContext.getWorkspaceId(), filter);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"deals.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }
}
