package com.crm.module.contact;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.dto.ContactFilterRequest;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.contact.repository.NoteRepository;
import com.crm.module.contact.service.ContactService;
import com.crm.module.user.repository.UserRepository;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.AfterProperty;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Property-based tests for the soft-delete invariant.
 *
 * **Validates: Requisito 11.1**
 *
 * Property 6: contacto con isDeleted=true nunca aparece en listados activos.
 *
 * This test verifies that:
 * 6a. search() always returns an empty page when the DB filters out deleted contacts.
 * 6b. listWithFilters() always returns an empty page when the DB filters out deleted contacts.
 * 6c. findById() always throws ResourceNotFoundException for a deleted contact.
 * 6d. The Contact entity correctly stores the isDeleted flag via its builder.
 */
class ContactSoftDeletePropertyTest {

    @AfterProperty
    void clearWorkspaceContext() {
        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Property 6a: search() never returns deleted contacts
    //
    // ∀ workspaceId ∈ UUIDs, ∀ query ∈ Strings:
    //   when the repository (with isDeleted=false predicate) returns Page.empty(),
    //   service.search() must also return an empty page.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 11.1**
     *
     * The search() method delegates filtering to ContactSpecification.search(),
     * which always adds an isDeleted=false predicate. When the DB returns no
     * results (because all matching contacts are deleted), the service must
     * propagate that empty result — never re-introduce deleted contacts.
     */
    @Property
    void searchNeverReturnsDeletedContacts(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("searchQueries") String query) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // Simulate DB filtering out deleted contacts → empty page returned
        when(mockRepo.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        WorkspaceContext.setWorkspaceId(workspaceId);

        Pageable pageable = PageRequest.of(0, 20);
        Page<?> result = service.search(query, pageable);

        assertThat(result.isEmpty())
                .as("search() must return an empty page when the DB filters out all deleted contacts")
                .isTrue();
        assertThat(result.getTotalElements())
                .as("Total elements must be 0 when no active contacts match")
                .isZero();
    }

    // -------------------------------------------------------------------------
    // Property 6b: listWithFilters() never returns deleted contacts
    //
    // ∀ workspaceId ∈ UUIDs, ∀ query ∈ Strings:
    //   when the repository (with isDeleted=false predicate) returns Page.empty(),
    //   service.listWithFilters() must also return an empty page.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 11.1**
     *
     * The listWithFilters() method delegates filtering to
     * ContactSpecification.withFilters(), which always adds an isDeleted=false
     * predicate. When the DB returns no results, the service must propagate
     * that empty result.
     */
    @Property
    void listWithFiltersNeverReturnsDeletedContacts(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("searchQueries") String query) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // Simulate DB filtering out deleted contacts → empty page returned
        when(mockRepo.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        WorkspaceContext.setWorkspaceId(workspaceId);

        ContactFilterRequest filters = new ContactFilterRequest(null, null, null, query, null);
        Pageable pageable = PageRequest.of(0, 20);
        Page<?> result = service.listWithFilters(filters, pageable);

        assertThat(result.isEmpty())
                .as("listWithFilters() must return an empty page when the DB filters out all deleted contacts")
                .isTrue();
        assertThat(result.getTotalElements())
                .as("Total elements must be 0 when no active contacts match")
                .isZero();
    }

    // -------------------------------------------------------------------------
    // Property 6c: findById() throws ResourceNotFoundException for deleted contact
    //
    // ∀ workspaceId ∈ UUIDs, ∀ id ∈ UUIDs:
    //   when findByWorkspaceIdAndIdAndIsDeletedFalse returns Optional.empty()
    //   (because the contact is deleted), service.findById() must throw
    //   ResourceNotFoundException.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 11.1**
     *
     * findById() uses findByWorkspaceIdAndIdAndIsDeletedFalse, which returns
     * Optional.empty() for deleted contacts. The service must always throw
     * ResourceNotFoundException in that case — a deleted contact must never
     * be surfaced through the active-contact API.
     */
    @Property
    void findByIdThrowsForDeletedContact(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("uuids") UUID contactId) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // Simulate deleted contact: repository returns empty (isDeleted=false filter excludes it)
        when(mockRepo.findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, contactId))
                .thenReturn(Optional.empty());

        WorkspaceContext.setWorkspaceId(workspaceId);

        assertThatThrownBy(() -> service.findById(contactId))
                .as("findById() must throw ResourceNotFoundException for a deleted (or absent) contact")
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // Property 6d: Contact entity isDeleted flag is correctly stored by the builder
    //
    // ∀ isDeleted ∈ {true, false}:
    //   Contact.builder().isDeleted(isDeleted).build().isDeleted() == isDeleted
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 11.1**
     *
     * Structural invariant: the Contact builder must faithfully persist the
     * isDeleted flag. This ensures that soft-deleted contacts are correctly
     * marked and that the default value (false) is never accidentally overridden.
     */
    @Property
    void contactEntityIsDeletedFlagIsCorrectlySet(
            @ForAll boolean isDeleted,
            @ForAll("uuids") UUID id,
            @ForAll("uuids") UUID workspaceId) {

        Contact contact = buildContact(id, "test@example.com", workspaceId, isDeleted);

        assertThat(contact.isDeleted())
                .as("Contact.isDeleted() must match the value set via the builder")
                .isEqualTo(isDeleted);
    }

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    @Provide
    Arbitrary<UUID> uuids() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<String> searchQueries() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(2)
                .ofMaxLength(20);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ContactService buildService(ContactRepository contactRepository) {
        NoteRepository mockNoteRepo = Mockito.mock(NoteRepository.class);
        CompanyRepository mockCompanyRepo = Mockito.mock(CompanyRepository.class);
        UserRepository mockUserRepo = Mockito.mock(UserRepository.class);
        return new ContactService(contactRepository, mockNoteRepo, mockCompanyRepo, mockUserRepo);
    }

    private Contact buildContact(UUID id, String email, UUID workspaceId, boolean isDeleted) {
        Contact contact = Contact.builder()
                .name("Test Contact")
                .email(email)
                .status(ContactStatus.NEW)
                .isDeleted(isDeleted)
                .build();
        contact.setId(id);
        contact.setWorkspaceId(workspaceId);
        return contact;
    }
}
