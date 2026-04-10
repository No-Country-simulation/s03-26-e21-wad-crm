package com.crm.module.export.service;

import com.crm.module.company.entity.Company;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.repository.DealRepository;
import com.crm.module.export.dto.ContactExportFilter;
import com.crm.module.export.dto.DealExportFilter;
import com.crm.module.export.dto.TaskExportFilter;
import com.crm.module.task.entity.Task;
import com.crm.module.task.repository.TaskRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.opencsv.CSVWriter;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servicio de exportación de contactos y deals en CSV y PDF.
 * Requisitos: 8.2 (aislamiento por workspace), 11.1 (filtros de contactos)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExportService {

    private final ContactRepository contactRepository;
    private final DealRepository dealRepository;
    private final CompanyRepository companyRepository;
    private final TaskRepository taskRepository;

    // ── CSV Headers ───────────────────────────────────────────────────────────

    private static final String[] CONTACT_CSV_HEADERS = {
            "ID", "Nombre", "Email", "Teléfono", "Cargo", "Estado",
            "Empresa", "Asignado a", "Workspace ID", "Creado en", "Actualizado en"
    };

    private static final String[] DEAL_CSV_HEADERS = {
            "ID", "Nombre", "Valor", "Contacto ID", "Etapa", "Asignado a",
            "Workspace ID", "Creado en", "Actualizado en"
    };

    private static final String[] TASK_CSV_HEADERS = {
            "ID", "Título", "Descripción", "Prioridad", "Fecha Límite",
            "Completada", "Contacto ID", "Deal ID", "Asignado a",
            "Workspace ID", "Creado en"
    };

    // ── PDF Column Widths ─────────────────────────────────────────────────────

    private static final float[] CONTACT_PDF_WIDTHS = {2, 3, 3, 2, 2, 2, 2};
    private static final float[] DEAL_PDF_WIDTHS    = {2, 3, 2, 2, 2, 2};

    // =========================================================================
    // CSV Exports
    // =========================================================================

    /**
     * Exporta contactos del workspace como CSV, respetando los filtros dados.
     * Req 8.2: siempre filtra por workspaceId.
     * Req 11.1: aplica los mismos filtros que el listado normal.
     */
    @Transactional(readOnly = true)
    public byte[] exportContactsCsv(UUID workspaceId, ContactExportFilter filters) {
        List<Contact> contacts = fetchContacts(workspaceId, filters);
        Map<UUID, String> companyNames = resolveCompanyNames(workspaceId, contacts);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(
                new OutputStreamWriter(out, StandardCharsets.UTF_8))) {

            writer.writeNext(CONTACT_CSV_HEADERS);

            for (Contact c : contacts) {
                writer.writeNext(new String[]{
                        str(c.getId()),
                        str(c.getName()),
                        str(c.getEmail()),
                        str(c.getPhone()),
                        str(c.getJobTitle()),
                        c.getStatus() != null ? c.getStatus().name() : "",
                        c.getCompanyId() != null ? companyNames.getOrDefault(c.getCompanyId(), str(c.getCompanyId())) : "",
                        str(c.getAssignedTo()),
                        str(c.getWorkspaceId()),
                        str(c.getCreatedAt()),
                        str(c.getUpdatedAt())
                });
            }
        } catch (Exception e) {
            log.error("Error generando CSV de contactos para workspace {}", workspaceId, e);
            throw new RuntimeException("Error al generar CSV de contactos", e);
        }

        return out.toByteArray();
    }

    /**
     * Exporta deals del workspace como CSV, respetando los filtros dados.
     * Req 8.2: siempre filtra por workspaceId y excluye eliminados.
     */
    @Transactional(readOnly = true)
    public byte[] exportDealsCsv(UUID workspaceId, DealExportFilter filters) {
        List<Deal> deals = fetchDeals(workspaceId, filters);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(
                new OutputStreamWriter(out, StandardCharsets.UTF_8))) {

            writer.writeNext(DEAL_CSV_HEADERS);

            for (Deal d : deals) {
                writer.writeNext(new String[]{
                        str(d.getId()),
                        str(d.getName()),
                        d.getValue() != null ? d.getValue().toPlainString() : "",
                        str(d.getContactId()),
                        d.getStage() != null ? d.getStage().getName() : "",
                        str(d.getAssignedTo()),
                        str(d.getWorkspaceId()),
                        str(d.getCreatedAt()),
                        str(d.getUpdatedAt())
                });
            }
        } catch (Exception e) {
            log.error("Error generando CSV de deals para workspace {}", workspaceId, e);
            throw new RuntimeException("Error al generar CSV de deals", e);
        }

        return out.toByteArray();
    }

    /**
     * Exporta tareas del workspace como CSV, respetando los filtros dados.
     * Req 8.2: siempre filtra por workspaceId.
     */
    @Transactional(readOnly = true)
    public byte[] exportTasksCsv(UUID workspaceId, TaskExportFilter filters) {
        List<Task> tasks = fetchTasks(workspaceId, filters);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(
                new OutputStreamWriter(out, StandardCharsets.UTF_8))) {

            writer.writeNext(TASK_CSV_HEADERS);

            for (Task t : tasks) {
                writer.writeNext(new String[]{
                        str(t.getId()),
                        str(t.getTitle()),
                        str(t.getDescription()),
                        t.getPriority() != null ? t.getPriority().name() : "",
                        str(t.getDueAt()),
                        t.isCompleted() ? "Sí" : "No",
                        str(t.getContactId()),
                        str(t.getDealId()),
                        str(t.getAssignedTo()),
                        str(t.getWorkspaceId()),
                        str(t.getCreatedAt())
                });
            }
        } catch (Exception e) {
            log.error("Error generando CSV de tareas para workspace {}", workspaceId, e);
            throw new RuntimeException("Error al generar CSV de tareas", e);
        }

        return out.toByteArray();
    }

    // =========================================================================
    // PDF Export
    // =========================================================================

    /**
     * Exporta contactos del workspace como PDF con tabla de columnas principales.
     * Req 8.2: siempre filtra por workspaceId.
     * Req 11.1: aplica los mismos filtros que el listado normal.
     */
    @Transactional(readOnly = true)
    public byte[] exportContactsPdf(UUID workspaceId, ContactExportFilter filters) {
        List<Contact> contacts = fetchContacts(workspaceId, filters);
        Map<UUID, String> companyNames = resolveCompanyNames(workspaceId, contacts);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter pdfWriter = new PdfWriter(out);
            PdfDocument pdfDoc = new PdfDocument(pdfWriter);
            Document document = new Document(pdfDoc);

            document.add(new Paragraph("Contactos")
                    .setBold()
                    .setFontSize(16)
                    .setMarginBottom(10));

            Table table = new Table(UnitValue.createPercentArray(CONTACT_PDF_WIDTHS))
                    .useAllAvailableWidth();

            // Header row
            String[] pdfHeaders = {"Nombre", "Email", "Teléfono", "Cargo", "Estado", "Empresa", "Asignado a"};
            for (String header : pdfHeaders) {
                table.addHeaderCell(headerCell(header));
            }

            // Data rows
            for (Contact c : contacts) {
                table.addCell(cell(c.getName()));
                table.addCell(cell(c.getEmail()));
                table.addCell(cell(c.getPhone()));
                table.addCell(cell(c.getJobTitle()));
                table.addCell(cell(c.getStatus() != null ? c.getStatus().name() : ""));
                String companyName = c.getCompanyId() != null
                        ? companyNames.getOrDefault(c.getCompanyId(), "")
                        : "";
                table.addCell(cell(companyName));
                table.addCell(cell(c.getAssignedTo()));
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            log.error("Error generando PDF de contactos para workspace {}", workspaceId, e);
            throw new RuntimeException("Error al generar PDF de contactos", e);
        }

        return out.toByteArray();
    }

    // =========================================================================
    // Query helpers — JPA Specifications (mismo patrón que TaskService)
    // =========================================================================

    /**
     * Obtiene todos los contactos del workspace aplicando los filtros.
     * Sin paginación: exporta todos los registros coincidentes.
     */
    private List<Contact> fetchContacts(UUID workspaceId, ContactExportFilter f) {
        Specification<Contact> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Req 8.2: aislamiento por workspace
            predicates.add(cb.equal(root.get("workspaceId"), workspaceId));
            // Excluir eliminados (mismo comportamiento que listado normal)
            predicates.add(cb.equal(root.get("deleted"), false));

            if (f != null) {
                // Req 11.1: búsqueda case-insensitive en name, email, phone
                if (f.search() != null && !f.search().isBlank()) {
                    String pattern = "%" + f.search().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), pattern),
                            cb.like(cb.lower(root.get("email")), pattern),
                            cb.like(cb.lower(root.get("phone")), pattern)
                    ));
                }
                if (f.status() != null) {
                    predicates.add(cb.equal(root.get("status"), f.status()));
                }
                if (f.assignedTo() != null) {
                    predicates.add(cb.equal(root.get("assignedTo"), f.assignedTo()));
                }
                // tagIds filter: requires Tag entity + contact_tags join table (Task 6.1).
                // Uncomment when Contact.tags @ManyToMany relationship is available:
                // if (f.tagIds() != null && !f.tagIds().isEmpty()) {
                //     predicates.add(root.join("tags").get("id").in(f.tagIds()));
                //     query.distinct(true);
                // }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return contactRepository.findAll(spec);
    }

    /**
     * Obtiene todos los deals del workspace aplicando los filtros.
     * Sin paginación: exporta todos los registros coincidentes.
     */
    private List<Deal> fetchDeals(UUID workspaceId, DealExportFilter f) {
        Specification<Deal> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Req 8.2: aislamiento por workspace
            predicates.add(cb.equal(root.get("workspaceId"), workspaceId));
            // Siempre excluir eliminados
            predicates.add(cb.equal(root.get("deleted"), false));

            if (f != null) {
                if (f.search() != null && !f.search().isBlank()) {
                    String pattern = "%" + f.search().toLowerCase() + "%";
                    predicates.add(cb.like(cb.lower(root.get("name")), pattern));
                }
                if (f.stageId() != null) {
                    predicates.add(cb.equal(root.get("stage").get("id"), f.stageId()));
                }
                if (f.assignedTo() != null) {
                    predicates.add(cb.equal(root.get("assignedTo"), f.assignedTo()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return dealRepository.findAll(spec);
    }

    /**
     * Obtiene todas las tareas del workspace aplicando los filtros.
     * Sin paginación: exporta todos los registros coincidentes.
     */
    private List<Task> fetchTasks(UUID workspaceId, TaskExportFilter f) {
        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("workspaceId"), workspaceId));

            if (f != null) {
                if (f.search() != null && !f.search().isBlank()) {
                    String pattern = "%" + f.search().toLowerCase() + "%";
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("title")), pattern),
                            cb.like(cb.lower(root.get("description")), pattern)
                    ));
                }
                if (f.priority() != null && !f.priority().isBlank()) {
                    predicates.add(cb.equal(root.get("priority"), f.priority()));
                }
                if (f.completed() != null) {
                    predicates.add(cb.equal(root.get("completed"), f.completed()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return taskRepository.findAll(spec);
    }

    /**
     * Resuelve nombres de empresa para los contactos que tienen companyId.
     * Evita N+1 cargando todas las empresas necesarias en una sola consulta.
     */
    private Map<UUID, String> resolveCompanyNames(UUID workspaceId, List<Contact> contacts) {
        List<UUID> companyIds = contacts.stream()
                .map(Contact::getCompanyId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (companyIds.isEmpty()) {
            return Map.of();
        }

        return companyRepository.findAllById(companyIds).stream()
                .filter(c -> workspaceId.equals(c.getWorkspaceId()))
                .collect(Collectors.toMap(Company::getId, Company::getName));
    }

    // =========================================================================
    // PDF cell builders
    // =========================================================================

    private Cell headerCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setPadding(4);
    }

    private Cell cell(Object value) {
        return new Cell()
                .add(new Paragraph(str(value)))
                .setPadding(3);
    }

    // =========================================================================
    // Utility
    // =========================================================================

    private String str(Object value) {
        return value != null ? value.toString() : "";
    }
}
