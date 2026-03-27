package com.crm.module.export.dto;

import com.crm.module.contact.entity.ContactStatus;

import java.util.List;
import java.util.UUID;

/**
 * Filtros para exportación de contactos.
 * Replica los mismos filtros de ContactService.listWithFilters.
 * Requisitos: 11.1 (filtros de contactos), 8.2 (aislamiento por workspace)
 */
public record ContactExportFilter(
        String search,
        ContactStatus status,
        List<UUID> tagIds,
        UUID assignedTo
) {
    public ContactExportFilter() {
        this(null, null, null, null);
    }
}
