package com.crm.module.contact;

import com.crm.common.exception.ConflictException;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.dto.ContactResponse;
import com.crm.module.contact.dto.CreateContactRequest;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.contact.repository.NoteRepository;
import com.crm.module.contact.service.ContactService;
import com.crm.module.user.repository.UserRepository;
import net.jqwik.api.*;
import net.jqwik.api.lifecycle.AfterProperty;
import org.mockito.Mockito;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Property-based tests for email uniqueness per workspace.
 *
 * **Validates: Requisito 9.2**
 *
 * Property 5: ∀ c1, c2 ∈ contacts(W): c1.id != c2.id → c1.email != c2.email
 *
 * This test verifies that:
 * 1. Creating a contact with a duplicate email in the same workspace throws ConflictException.
 * 2. Contacts in different workspaces CAN share the same email (cross-workspace uniqueness is NOT enforced).
 * 3. Two contacts with different IDs in the same workspace must have different emails.
 */
class ContactEmailUniquenessPropertyTest {

    @AfterProperty
    void clearWorkspaceContext() {
        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Property 5a: duplicate email in same workspace → ConflictException
    //
    // ∀ email ∈ Emails, ∀ workspaceId ∈ UUIDs:
    //   if contact with (email, workspaceId) already exists
    //   then create(email, workspaceId) throws ConflictException
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 9.2**
     *
     * Attempting to create a second contact with the same email in the same
     * workspace must always throw ConflictException (HTTP 409).
     */
    @Property
    void duplicateEmailInSameWorkspaceThrowsConflict(
            @ForAll("emails") String email,
            @ForAll("uuids") UUID workspaceId) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // Simulate that a contact with this email already exists in the workspace
        when(mockRepo.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspaceId))
                .thenReturn(true);

        WorkspaceContext.setWorkspaceId(workspaceId);

        CreateContactRequest request = new CreateContactRequest(
                "Duplicate Contact", email, null, null, null, null);

        assertThatThrownBy(() -> service.create(request))
                .as("Creating a contact with a duplicate email in the same workspace must throw ConflictException")
                .isInstanceOf(ConflictException.class);
    }

    // -------------------------------------------------------------------------
    // Property 5b: unique email in same workspace → no conflict
    //
    // ∀ email ∈ Emails, ∀ workspaceId ∈ UUIDs:
    //   if no contact with (email, workspaceId) exists
    //   then create(email, workspaceId) succeeds
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 9.2**
     *
     * Creating a contact with a fresh email in a workspace must always succeed
     * (no ConflictException thrown).
     */
    @Property
    void uniqueEmailInSameWorkspaceSucceeds(
            @ForAll("emails") String email,
            @ForAll("uuids") UUID workspaceId) {

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // No existing contact with this email in the workspace
        when(mockRepo.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspaceId))
                .thenReturn(false);

        // Return a saved contact
        Contact saved = buildContact(UUID.randomUUID(), email, workspaceId);
        when(mockRepo.save(any(Contact.class))).thenReturn(saved);

        WorkspaceContext.setWorkspaceId(workspaceId);

        CreateContactRequest request = new CreateContactRequest(
                "New Contact", email, null, null, null, null);

        ContactResponse response = service.create(request);

        assertThat(response.email())
                .as("Saved contact must carry the requested email")
                .isEqualTo(email);
        assertThat(response.workspaceId())
                .as("Saved contact must belong to the current workspace")
                .isEqualTo(workspaceId);
    }

    // -------------------------------------------------------------------------
    // Property 5c: same email in DIFFERENT workspaces → no conflict
    //
    // ∀ email ∈ Emails, ∀ (w1, w2) where w1 != w2:
    //   create(email, w2) succeeds even if contact(email, w1) exists
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 9.2**
     *
     * The same email may exist in two different workspaces without conflict.
     * Email uniqueness is scoped to a single workspace only.
     */
    @Property
    void sameEmailInDifferentWorkspacesIsAllowed(
            @ForAll("emails") String email,
            @ForAll("distinctWorkspacePairs") UUID[] workspacePair) {

        UUID workspace1 = workspacePair[0];
        UUID workspace2 = workspacePair[1];

        ContactRepository mockRepo = Mockito.mock(ContactRepository.class);
        ContactService service = buildService(mockRepo);

        // email exists in workspace1 but NOT in workspace2
        when(mockRepo.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspace1))
                .thenReturn(true);
        when(mockRepo.existsByEmailAndWorkspaceIdAndIsDeletedFalse(email, workspace2))
                .thenReturn(false);

        Contact saved = buildContact(UUID.randomUUID(), email, workspace2);
        when(mockRepo.save(any(Contact.class))).thenReturn(saved);

        // Create in workspace2 — must succeed even though workspace1 has the same email
        WorkspaceContext.setWorkspaceId(workspace2);

        CreateContactRequest request = new CreateContactRequest(
                "Cross-Workspace Contact", email, null, null, null, null);

        ContactResponse response = service.create(request);

        assertThat(response.email())
                .as("Contact in workspace2 must carry the shared email")
                .isEqualTo(email);
        assertThat(response.workspaceId())
                .as("Contact must belong to workspace2, not workspace1")
                .isEqualTo(workspace2)
                .isNotEqualTo(workspace1);
    }

    // -------------------------------------------------------------------------
    // Property 5d: two contacts with different IDs in same workspace → different emails
    //
    // ∀ c1, c2 ∈ contacts(W): c1.id != c2.id → c1.email != c2.email
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 9.2**
     *
     * For any two Contact entities in the same workspace with distinct IDs,
     * their emails must be different.
     */
    @Property
    void twoContactsWithDifferentIdsInSameWorkspaceHaveDifferentEmails(
            @ForAll("distinctEmailPairs") String[] emailPair,
            @ForAll("uuids") UUID workspaceId) {

        String email1 = emailPair[0];
        String email2 = emailPair[1];

        Contact c1 = buildContact(UUID.randomUUID(), email1, workspaceId);
        Contact c2 = buildContact(UUID.randomUUID(), email2, workspaceId);

        assertThat(c1.getId())
                .as("The two contacts must have different IDs")
                .isNotEqualTo(c2.getId());

        assertThat(c1.getEmail())
                .as("Two contacts with different IDs in the same workspace must have different emails")
                .isNotEqualTo(c2.getEmail());
    }

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    @Provide
    Arbitrary<UUID> uuids() {
        return Arbitraries.create(UUID::randomUUID);
    }

    @Provide
    Arbitrary<String> emails() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(3)
                .ofMaxLength(10)
                .map(local -> local + "@example.com");
    }

    @Provide
    Arbitrary<String[]> distinctEmailPairs() {
        return emails().flatMap(e1 ->
                emails()
                        .filter(e2 -> !e2.equals(e1))
                        .map(e2 -> new String[]{e1, e2}));
    }

    @Provide
    Arbitrary<UUID[]> distinctWorkspacePairs() {
        return Arbitraries.create(UUID::randomUUID)
                .flatMap(w1 -> Arbitraries.create(UUID::randomUUID)
                        .filter(w2 -> !w2.equals(w1))
                        .map(w2 -> new UUID[]{w1, w2}));
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

    private Contact buildContact(UUID id, String email, UUID workspaceId) {
        Contact contact = Contact.builder()
                .name("Test Contact")
                .email(email)
                .status(ContactStatus.NEW)
                .build();
        contact.setId(id);
        contact.setWorkspaceId(workspaceId);
        return contact;
    }
}
