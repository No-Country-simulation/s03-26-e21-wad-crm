package com.crm.module.export.dto;

public record TaskExportFilter(
    String search,
    String priority,
    Boolean completed
) {
    public TaskExportFilter {
        if (search == null) search = "";
        if (priority == null) priority = "";
    }

    public TaskExportFilter() {
        this(null, null, null);
    }
}
