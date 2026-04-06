package com.crm.module.contact.controller;

import com.crm.module.contact.dto.*;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Contact management endpoints.
 *
 * Satisfies: Requirements 9.1, 10.1, 11.1, 12.1, 13.1, 13.2
 */
@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // -------------------------------------------------------------------------
    // Req 9.1 – create contact
    // -------------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<ContactResponse> create(
            @Valid @RequestBody CreateContactRequest request) {
        ContactResponse created = contactService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // -------------------------------------------------------------------------
    // Req 11.1, 12.1 – list contacts with search and filters
    // -------------------------------------------------------------------------

    @GetMapping
    public ResponseEntity<Page<ContactResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(required = false) List<UUID> tagIds,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        ContactFilterRequest filters = new ContactFilterRequest(status, tagIds, assignedTo, search, sort);
        return ResponseEntity.ok(contactService.listWithFilters(filters, pageable));
    }

    // -------------------------------------------------------------------------
    // Req 13.1 – get contact detail
    // -------------------------------------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(contactService.findById(id));
    }

    // -------------------------------------------------------------------------
    // Req 10.1 – update contact
    // -------------------------------------------------------------------------

    @PatchMapping("/{id}")
    public ResponseEntity<ContactResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContactRequest request) {
        return ResponseEntity.ok(contactService.update(id, request));
    }

    // -------------------------------------------------------------------------
    // Req 13.2 – list notes for a contact
    // -------------------------------------------------------------------------

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<NoteResponse>> listNotes(@PathVariable UUID id) {
        return ResponseEntity.ok(contactService.listNotes(id));
    }

    // -------------------------------------------------------------------------
    // Req 13.2 – add note to a contact
    // -------------------------------------------------------------------------

    @PostMapping("/{id}/notes")
    public ResponseEntity<NoteResponse> addNote(
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        NoteResponse note = contactService.addNote(id, request.content(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    // -------------------------------------------------------------------------
    // Req 11.3 – soft delete contact
    // -------------------------------------------------------------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
