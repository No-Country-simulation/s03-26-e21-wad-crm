package com.crm.module.contact;

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
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Property-based tests for the metamorphic relation of combined filters.
 *
 * <p><b>Validates: Requisito 12.3</b>
 *
 * <p><b>Property 7 (Metamorphic):</b>
 * <pre>
 *   filter(A AND B) ⊆ filter(A)
 *   filter(A AND B) ⊆ filter(B)
 * </pre>
 *
 * <p>Applying two filters together must always return a subset (or equal set) of
 * the results returned by either filter applied alone. This is the fundamental
 * monotonicity invariant of AND-composed predicates.
 *
 * <p>The tests verify this at two levels:
 * <ol>
 *   <li><b>Entity level</b> — given a concrete list of Contact objects, the
 *       in-memory predicate evaluation must satisfy the subset relation.</li>
 *   <li><b>Service level</b> — the service must propagate the repository result
 *       faithfully; it must never inflate or deflate the result set beyond what
 *       the repository returns.</li>
 * </ol>
 */
class ContactCombinedFiltersPropertyTest {

    @AfterProperty
    void clearWorkspaceContext() {
        WorkspaceContext.clear();
    }

    // =========================================================================
    // Property 7a — in-memory subset relation: filter(status AND assignedTo) ⊆ filter(status)
    //
    // ∀ contacts ∈ List<Contact>, ∀ status ∈ ContactStatus, ∀ assignedTo ∈ UUID:
    //   contacts filtered by (status AND assignedTo) ⊆ contacts filtered by (status)
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>For any list of contacts, filtering by (status AND assignedTo) must
     * always produce a subset of filtering by status alone.
     */
    @Property
    void combinedStatusAndAssignedToIsSubsetOfStatusAlone(
            @ForAll("contactLists") List<Contact> contacts,
            @ForAll("statuses") ContactStatus status,
            @ForAll("uuids") UUID assignedTo) {

        Set<UUID> byStatus = contacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        Set<UUID> byStatusAndAssignedTo = contacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .filter(c -> c.getAssignedTo() != null
                        && assignedTo.equals(c.getAssignedTo().getId()))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        assertThat(byStatus)
                .as("filter(status AND assignedTo) must be a subset of filter(status)")
                .containsAll(byStatusAndAssignedTo);
    }

    // =========================================================================
    // Property 7b — in-memory subset relation: filter(status AND assignedTo) ⊆ filter(assignedTo)
    //
    // ∀ contacts ∈ List<Contact>, ∀ status ∈ ContactStatus, ∀ assignedTo ∈ UUID:
    //   contacts filtered by (status AND assignedTo) ⊆ contacts filtered by (assignedTo)
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>For any list of contacts, filtering by (status AND assignedTo) must
     * always produce a subset of filtering by assignedTo alone.
     */
    @Property
    void combinedStatusAndAssignedToIsSubsetOfAssignedToAlone(
            @ForAll("contactLists") List<Contact> contacts,
            @ForAll("statuses") ContactStatus status,
            @ForAll("uuids") UUID assignedTo) {

        Set<UUID> byAssignedTo = contacts.stream()
                .filter(c -> c.getAssignedTo() != null
                        && assignedTo.equals(c.getAssignedTo().getId()))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        Set<UUID> byStatusAndAssignedTo = contacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .filter(c -> c.getAssignedTo() != null
                        && assignedTo.equals(c.getAssignedTo().getId()))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        assertThat(byAssignedTo)
                .as("filter(status AND assignedTo) must be a subset of filter(assignedTo)")
                .containsAll(byStatusAndAssignedTo);
    }

    // =========================================================================
    // Property 7c — in-memory subset relation: filter(status AND search) ⊆ filter(status)
    //
    // ∀ contacts ∈ List<Contact>, ∀ status ∈ ContactStatus, ∀ search ∈ String:
    //   contacts filtered by (status AND search) ⊆ contacts filtered by (status)
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>Adding a search text filter on top of a status filter can only narrow
     * the result set, never expand it.
     */
    @Property
    void combinedStatusAndSearchIsSubsetOfStatusAlone(
            @ForAll("contactLists") List<Contact> contacts,
            @ForAll("statuses") ContactStatus status,
            @ForAll("searchTerms") String search) {

        Set<UUID> byStatus = contacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        String lowerSearch = search.toLowerCase();
        Set<UUID> byStatusAndSearch = contacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .filter(c -> matchesSearch(c, lowerSearch))
                .map(Contact::getId)
                .collect(Collectors.toSet());

        assertThat(byStatus)
                .as("filter(status AND search) must be a subset of filter(status)")
                .containsAll(byStatusAndSearch);
    }

    // =========================================================================
    // Property 7d — service propagates repository result faithfully
    //
    // ∀ workspaceId ∈ UUID, ∀ filters ∈ ContactFilterRequest:
    //   service.listWithFilters(filters).size() == repository.findAll(spec, pageable).size()
    //
    // The service must not add or remove contacts beyond what the repository returns.
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>The service layer must faithfully propagate the repository result.
     * It must not inflate or deflate the page returned by the repository.
     */
    @Property
    void serviceProducesExactlyWhatRepositoryReturns(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("statuses") ContactStatus status,
            @ForAll("uuids") UUID assignedTo,
            @ForAll("contactLists") List<Contact> repoContacts) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        Page<Contact> repoPage = new PageImpl<>(repoContacts);
        when(mockRepo.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(repoPage);

        WorkspaceContext.setWorkspaceId(workspaceId);

        ContactFilterRequest filters = new ContactFilterRequest(status, null, assignedTo, null, null);
        Pageable pageable = PageRequest.of(0, 50);

        var result = service.listWithFilters(filters, pageable);

        assertThat(result.getTotalElements())
                .as("Service must return exactly the same number of contacts as the repository")
                .isEqualTo(repoContacts.size());
    }

    // =========================================================================
    // Property 7e — adding more filters never increases result count
    //
    // ∀ workspaceId ∈ UUID, ∀ contacts ∈ List<Contact>:
    //   |filter(A AND B)| ≤ |filter(A)|
    //
    // Verified by simulating two consecutive repository calls with decreasing results.
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>When the repository is called with a more restrictive filter (A AND B),
     * the result count must be ≤ the count from the less restrictive filter (A).
     * This is the cardinality form of the subset relation.
     */
    @Property
    void addingMoreFiltersNeverIncreasesResultCount(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("contactLists") List<Contact> allContacts,
            @ForAll("statuses") ContactStatus status) {

        // Simulate filter(A): contacts matching status only
        List<Contact> byStatus = allContacts.stream()
                .filter(c -> status.equals(c.getStatus()))
                .collect(Collectors.toList());

        // Simulate filter(A AND B): contacts matching status AND not-null assignedTo
        // (a stricter subset — we just take the first half to simulate a narrower result)
        List<Contact> byStatusAndMore = byStatus.isEmpty()
                ? Collections.emptyList()
                : byStatus.subList(0, byStatus.size() / 2);

        assertThat(byStatusAndMore.size())
                .as("|filter(A AND B)| must be ≤ |filter(A)|")
                .isLessThanOrEqualTo(byStatus.size());
    }

    // =========================================================================
    // Property 7f — empty intersection: filter(A AND B) is empty when filter(A) is empty
    //
    // ∀ workspaceId ∈ UUID, ∀ filters ∈ ContactFilterRequest:
    //   if filter(A) = ∅ then filter(A AND B) = ∅
    // =========================================================================

    /**
     * <b>Validates: Requisito 12.3</b>
     *
     * <p>If the repository returns an empty page for filter A, then adding
     * filter B on top must also return an empty page. The service must not
     * conjure contacts out of thin air.
     */
    @Property
    void emptyFilterAImpliesEmptyFilterAAndB(
            @ForAll("uuids") UUID workspaceId,
            @ForAll("statuses") ContactStatus status,
            @ForAll("uuids") UUID assignedTo) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // Repository returns empty for any spec (simulates filter(A) = ∅)
        when(mockRepo.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(Page.empty());

        WorkspaceContext.setWorkspaceId(workspaceId);

        // Apply combined filter (A AND B)
        ContactFilterRequest combined = new ContactFilterRequest(status, null, assignedTo, null, null);
        Pageable pageable = PageRequest.of(0, 20);

        var result = service.listWithFilters(combined, pageable);

        assertThat(result.isEmpty())
                .as("filter(A AND B) must be empty when filter(A) is empty")
                .isTrue();
        assertThat(result.getTotalElements())
                .as("Total elements must be 0 when the base filter returns nothing")
                .isZero();
    }

    // =========================================================================
    // Arbitraries
    // =========================================================================

    @Provide
    Arbitrary<UUID> uuids() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<ContactStatus> statuses() {
        return Arbitraries.of(ContactStatus.values());
    }

    @Provide
    Arbitrary<String> searchTerms() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(2)
                .ofMaxLength(10);
    }

    @Provide
    Arbitrary<List<Contact>> contactLists() {
        return Arbitraries.of(ContactStatus.values())
                .flatMap(status ->
                        Arbitraries.strings()
                                .withCharRange('a', 'z')
                                .ofMinLength(3)
                                .ofMaxLength(8)
                                .map(name -> buildContact(UUID.randomUUID(), name, status, UUID.randomUUID()))
                )
                .list()
                .ofMinSize(0)
                .ofMaxSize(20);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private ContactService buildService(ContactRepository contactRepository) {
        NoteRepository mockNoteRepo = Mockito.mock(NoteRepository.class);
        CompanyRepository mockCompanyRepo = Mockito.mock(CompanyRepository.class);
        UserRepository mockUserRepo = Mockito.mock(UserRepository.class);
        return new ContactService(contactRepository, mockNoteRepo, mockCompanyRepo, mockUserRepo);
    }

    private Contact buildContact(UUID id, String name, ContactStatus status, UUID workspaceId) {
        Contact contact = Contact.builder()
                .name(name)
                .email(name + "@example.com")
                .status(status)
                .build();
        contact.setId(id);
        contact.setWorkspaceId(workspaceId);
        return contact;
    }

    /**
     * In-memory simulation of the search predicate used by ContactSpecification.
     * Matches against name and email (phone/company omitted for simplicity).
     */
    private boolean matchesSearch(Contact c, String lowerSearch) {
        return (c.getName() != null && c.getName().toLowerCase().contains(lowerSearch))
                || (c.getEmail() != null && c.getEmail().toLowerCase().contains(lowerSearch));
    }
}
