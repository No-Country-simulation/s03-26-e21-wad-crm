package com.crm.module.contact.service;

import com.crm.common.exception.ConflictException;
import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.company.entity.Company;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.dto.*;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.entity.Note;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.contact.repository.ContactSpecification;
import com.crm.module.contact.repository.NoteRepository;
import com.crm.module.user.entity.User;
import com.crm.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final NoteRepository noteRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    @Transactional
    public ContactResponse create(CreateContactRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        if (contactRepository.existsByEmailAndWorkspaceIdAndIsDeletedFalse(
                request.email(), workspaceId)) {
            throw new ConflictException(
                    "A contact with email '" + request.email() + "' already exists in this workspace");
        }

        Contact contact = Contact.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .jobTitle(request.jobTitle())
                .status(ContactStatus.NEW)
                .build();
        contact.setWorkspaceId(workspaceId);

        if (request.companyId() != null) {
            Company company = companyRepository.findByWorkspaceIdAndId(workspaceId, request.companyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", request.companyId()));
            contact.setCompany(company);
        }

        if (request.assignedTo() != null) {
            User user = userRepository.findById(request.assignedTo())
                    .filter(u -> workspaceId.equals(u.getWorkspaceId()))
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.assignedTo()));
            contact.setAssignedTo(user);
        }

        return toResponse(contactRepository.save(contact));
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    @Transactional
    public ContactResponse update(UUID id, UpdateContactRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        Contact contact = contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id));

        if (request.email() != null && !request.email().equals(contact.getEmail())) {
            if (contactRepository.existsByEmailAndWorkspaceIdAndIdNotAndIsDeletedFalse(
                    request.email(), workspaceId, id)) {
                throw new ConflictException(
                        "A contact with email '" + request.email() + "' already exists in this workspace");
            }
            contact.setEmail(request.email());
        }

        if (request.name() != null) contact.setName(request.name());
        if (request.phone() != null) contact.setPhone(request.phone());
        if (request.jobTitle() != null) contact.setJobTitle(request.jobTitle());
        if (request.status() != null) contact.setStatus(request.status());

        if (request.companyId() != null) {
            Company company = companyRepository.findByWorkspaceIdAndId(workspaceId, request.companyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", request.companyId()));
            contact.setCompany(company);
        }

        if (request.assignedTo() != null) {
            User user = userRepository.findById(request.assignedTo())
                    .filter(u -> workspaceId.equals(u.getWorkspaceId()))
                    .orElseThrow(() -> new ResourceNotFoundException("User", request.assignedTo()));
            contact.setAssignedTo(user);
        }

        return toResponse(contactRepository.save(contact));
    }

    // -------------------------------------------------------------------------
    // Find by ID
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public ContactResponse findById(UUID id) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Contact contact = contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", id));
        return toResponse(contact);
    }

    // -------------------------------------------------------------------------
    // Search (req 11)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<ContactResponse> search(String query, Pageable pageable) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Specification<Contact> spec = ContactSpecification.search(query, workspaceId);
        return contactRepository.findAll(spec, pageable).map(this::toResponse);
    }

    // -------------------------------------------------------------------------
    // List with filters (req 12)
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Page<ContactResponse> listWithFilters(ContactFilterRequest filters, Pageable pageable) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        // Build sort from filter's sort param if provided, otherwise use pageable's sort
        Pageable effectivePageable = buildPageable(filters.sort(), pageable);

        Specification<Contact> spec = ContactSpecification.withFilters(filters, workspaceId);
        return contactRepository.findAll(spec, effectivePageable).map(this::toResponse);
    }

    // -------------------------------------------------------------------------
    // Notes (req 13)
    // -------------------------------------------------------------------------

    @Transactional
    public NoteResponse addNote(UUID contactId, String content, UUID userId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        // Verify contact belongs to workspace
        contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", contactId));

        Note note = Note.builder()
                .contactId(contactId)
                .workspaceId(workspaceId)
                .content(content)
                .createdBy(userId)
                .build();

        return toNoteResponse(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> listNotes(UUID contactId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        // Verify contact belongs to workspace
        contactRepository.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", contactId));

        return noteRepository.findByContactIdOrderByCreatedAtDesc(contactId)
                .stream()
                .map(this::toNoteResponse)
                .collect(Collectors.toList());
    }

    // -------------------------------------------------------------------------
    // Mapping helpers
    // -------------------------------------------------------------------------

    private ContactResponse toResponse(Contact c) {
        ContactResponse.CompanyInfo companyInfo = c.getCompany() != null
                ? new ContactResponse.CompanyInfo(c.getCompany().getId(), c.getCompany().getName())
                : null;

        ContactResponse.UserInfo userInfo = c.getAssignedTo() != null
                ? new ContactResponse.UserInfo(
                        c.getAssignedTo().getId(),
                        c.getAssignedTo().getName(),
                        c.getAssignedTo().getEmail())
                : null;

        Set<TagResponse> tags = c.getTags().stream()
                .map(t -> new TagResponse(t.getId(), t.getName(), t.getColor()))
                .collect(Collectors.toSet());

        return new ContactResponse(
                c.getId(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getJobTitle(),
                c.getStatus(),
                c.getWorkspaceId(),
                companyInfo,
                userInfo,
                tags,
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }

    private NoteResponse toNoteResponse(Note n) {
        return new NoteResponse(
                n.getId(),
                n.getContactId(),
                n.getContent(),
                n.getCreatedBy(),
                n.getCreatedAt()
        );
    }

    // -------------------------------------------------------------------------
    // Delete (soft delete)
    // -------------------------------------------------------------------------

    @Transactional
    public void delete(UUID contactId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        Contact contact = contactRepository.findByIdAndWorkspaceId(contactId, workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
        
        contact.setDeleted(true);
        contactRepository.save(contact);
    }

    // -------------------------------------------------------------------------
    // Sort helper
    // -------------------------------------------------------------------------

    /**
     * Builds a Pageable with the sort derived from the filter's sort string.
     * Supported values: createdAt, name, updatedAt (prefix with '-' for DESC).
     */
    private Pageable buildPageable(String sortParam, Pageable pageable) {
        if (sortParam == null || sortParam.isBlank()) {
            return pageable;
        }

        boolean desc = sortParam.startsWith("-");
        String field = desc ? sortParam.substring(1) : sortParam;

        String mappedField = switch (field) {
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            case "name" -> "name";
            default -> "createdAt";
        };

        Sort sort = desc
                ? Sort.by(Sort.Direction.DESC, mappedField)
                : Sort.by(Sort.Direction.ASC, mappedField);

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
    }
}
