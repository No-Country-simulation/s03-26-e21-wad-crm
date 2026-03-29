package com.crm.module.contact;

import com.crm.common.exception.ConflictException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.dto.*;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.contact.repository.NoteRepository;
import com.crm.module.contact.service.ContactService;
import com.crm.module.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link ContactService}.
 *
 * Validates: Requisitos 9.2, 11.2, 11.3, 12.3
 */
@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock ContactRepository contactRepository;
    @Mock NoteRepository noteRepository;
    @Mock CompanyRepository companyRepository;
    @Mock UserRepository userRepository;

    ContactService service;

    final UUID workspaceId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        service = new ContactService(contactRepository, noteRepository, companyRepository, userRepository);
        WorkspaceContext.setWorkspaceId(workspaceId);
    }

    @AfterEach
    void tearDown() {
        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Requisito 9.2 — duplicate email in same workspace → ConflictException
    // -------------------------------------------------------------------------

    @Test
    void create_duplicateEmailInSameWorkspace_throwsConflict() {
        // Arrange
        String email = "duplicate@example.com";
        when(contactRepository.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspaceId))
                .thenReturn(true);

        CreateContactRequest request = new CreateContactRequest(
                "John Doe", email, null, null, null, null);

        // Act & Assert
        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining(email);

        verify(contactRepository, never()).save(any());
    }

    @Test
    void create_uniqueEmailInWorkspace_succeeds() {
        // Arrange
        String email = "unique@example.com";
        when(contactRepository.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspaceId))
                .thenReturn(false);

        Contact saved = buildContact(UUID.randomUUID(), "Jane Doe", email, workspaceId);
        when(contactRepository.save(any(Contact.class))).thenReturn(saved);

        CreateContactRequest request = new CreateContactRequest(
                "Jane Doe", email, null, null, null, null);

        // Act
        ContactResponse response = service.create(request);

        // Assert
        assertThat(response.email()).isEqualTo(email);
        assertThat(response.workspaceId()).isEqualTo(workspaceId);
        assertThat(response.status()).isEqualTo(ContactStatus.NEW);
    }

    // -------------------------------------------------------------------------
    // Requisito 11.2 — search with no results → empty page (HTTP 200)
    // -------------------------------------------------------------------------

    @Test
    void search_noResults_returnsEmptyPage() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> emptyPage = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(contactRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(emptyPage);

        // Act
        Page<ContactResponse> result = service.search("nonexistent", pageable);

        // Assert
        assertThat(result.getContent()).isEmpty();
        assertThat(result.getTotalElements()).isZero();
    }

    @Test
    void search_withResults_returnsMatchingContacts() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Contact c = buildContact(UUID.randomUUID(), "Alice Smith", "alice@example.com", workspaceId);
        Page<Contact> page = new PageImpl<>(List.of(c), pageable, 1);

        when(contactRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(page);

        // Act
        Page<ContactResponse> result = service.search("alice", pageable);

        // Assert
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo("Alice Smith");
    }

    // -------------------------------------------------------------------------
    // Requisito 11.3 — pagination is respected
    // -------------------------------------------------------------------------

    @Test
    void search_paginationRespected_returnsCorrectPage() {
        // Arrange — page 1 of size 2, total 5 contacts
        Pageable pageable = PageRequest.of(1, 2);
        Contact c1 = buildContact(UUID.randomUUID(), "Contact C", "c@example.com", workspaceId);
        Contact c2 = buildContact(UUID.randomUUID(), "Contact D", "d@example.com", workspaceId);
        Page<Contact> page = new PageImpl<>(List.of(c1, c2), pageable, 5);

        when(contactRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(page);

        // Act
        Page<ContactResponse> result = service.search("contact", pageable);

        // Assert
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getTotalElements()).isEqualTo(5);
        assertThat(result.getTotalPages()).isEqualTo(3);
        assertThat(result.getNumber()).isEqualTo(1);
    }

    @Test
    void listWithFilters_paginationRespected() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 5);
        List<Contact> contacts = buildContacts(5, workspaceId);
        Page<Contact> page = new PageImpl<>(contacts, pageable, 12);

        when(contactRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(null, null, null, null, null);

        // Act
        Page<ContactResponse> result = service.listWithFilters(filters, pageable);

        // Assert
        assertThat(result.getContent()).hasSize(5);
        assertThat(result.getTotalElements()).isEqualTo(12);
    }

    // -------------------------------------------------------------------------
    // Requisito 12.3 — combined filters use AND logic
    // -------------------------------------------------------------------------

    @Test
    void listWithFilters_statusFilter_passedToSpecification() {
        // Arrange — only QUALIFIED contacts should be returned
        Pageable pageable = PageRequest.of(0, 10);
        Contact qualified = buildContact(UUID.randomUUID(), "Qualified Lead", "q@example.com", workspaceId);
        qualified.setStatus(ContactStatus.QUALIFIED);
        Page<Contact> page = new PageImpl<>(List.of(qualified), pageable, 1);

        when(contactRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(
                ContactStatus.QUALIFIED, null, null, null, null);

        // Act
        Page<ContactResponse> result = service.listWithFilters(filters, pageable);

        // Assert — all returned contacts have the requested status
        assertThat(result.getContent()).allMatch(r -> r.status() == ContactStatus.QUALIFIED);
        verify(contactRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void listWithFilters_assignedToFilter_passedToSpecification() {
        // Arrange
        UUID assignedUserId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> page = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(contactRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(
                null, null, assignedUserId, null, null);

        // Act
        Page<ContactResponse> result = service.listWithFilters(filters, pageable);

        // Assert — repository was queried (specification built with assignedTo filter)
        assertThat(result.getContent()).isEmpty();
        verify(contactRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void listWithFilters_combinedStatusAndAssignedTo_queriesRepositoryOnce() {
        // Arrange — combined AND: status=CONTACTED AND assignedTo=userId
        UUID assignedUserId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Contact c = buildContact(UUID.randomUUID(), "Bob", "bob@example.com", workspaceId);
        c.setStatus(ContactStatus.CONTACTED);
        Page<Contact> page = new PageImpl<>(List.of(c), pageable, 1);

        when(contactRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(
                ContactStatus.CONTACTED, null, assignedUserId, null, null);

        // Act
        Page<ContactResponse> result = service.listWithFilters(filters, pageable);

        // Assert — single repository call with combined spec (AND logic)
        assertThat(result.getContent()).hasSize(1);
        verify(contactRepository, times(1))
                .findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void listWithFilters_tagIdsFilter_passedToSpecification() {
        // Arrange
        List<UUID> tagIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> page = new PageImpl<>(Collections.emptyList(), pageable, 0);

        when(contactRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(
                null, tagIds, null, null, null);

        // Act
        service.listWithFilters(filters, pageable);

        // Assert — specification was built and repository was called
        verify(contactRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void listWithFilters_sortByName_appliesSortToPageable() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Contact c1 = buildContact(UUID.randomUUID(), "Alpha", "a@example.com", workspaceId);
        Contact c2 = buildContact(UUID.randomUUID(), "Beta", "b@example.com", workspaceId);
        Page<Contact> page = new PageImpl<>(List.of(c1, c2), pageable, 2);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(contactRepository.findAll(any(Specification.class), pageableCaptor.capture()))
                .thenReturn(page);

        ContactFilterRequest filters = new ContactFilterRequest(
                null, null, null, null, "name");

        // Act
        Page<ContactResponse> result = service.listWithFilters(filters, pageable);

        // Assert — the effective pageable carries a sort on "name" ASC
        assertThat(result.getContent()).hasSize(2);
        Sort.Order order = pageableCaptor.getValue().getSort().getOrderFor("name");
        assertThat(order).isNotNull();
        assertThat(order.getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Contact buildContact(UUID id, String name, String email, UUID wsId) {
        Contact c = Contact.builder()
                .name(name)
                .email(email)
                .status(ContactStatus.NEW)
                .build();
        c.setId(id);
        c.setWorkspaceId(wsId);
        return c;
    }

    private List<Contact> buildContacts(int count, UUID wsId) {
        List<Contact> list = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            list.add(buildContact(UUID.randomUUID(), "Contact " + i,
                    "contact" + i + "@example.com", wsId));
        }
        return list;
    }
}
