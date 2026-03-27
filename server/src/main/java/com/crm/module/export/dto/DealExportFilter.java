package com.crm.module.export.dto;

import java.util.UUID;

/**
 * Filtros para exportación de deals.
 * Replica los mismos filtros de DealService.list.
 * Requisitos: 8.2 (aislamiento por workspace)
 */
public record DealExportFilter(
        String search,
        UUID stageId,
        UUID assignedTo
) {
    public DealExportFilter() {
        this(null, null, null);
    }
}
