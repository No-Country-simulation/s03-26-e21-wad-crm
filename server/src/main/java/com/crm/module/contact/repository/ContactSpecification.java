package com.crm.module.contact.repository;

import com.crm.module.contact.dto.ContactFilterRequest;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.entity.Tag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class ContactSpecification {

    private ContactSpecification() {}

    /**
     * Builds a Specification for case-insensitive search across
     * name, email, phone, and company name.
     */
    public static Specification<Contact> search(String query, UUID workspaceId) {
        return (root, cq, cb) -> {
            String pattern = "%" + query.toLowerCase() + "%";

            Join<Object, Object> company = root.join("company", JoinType.LEFT);

            Predicate workspacePred = cb.equal(root.get("workspaceId"), workspaceId);
            Predicate notDeleted = cb.isFalse(root.get("isDeleted"));
            Predicate textPred = cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern),
                    cb.like(cb.lower(company.get("name")), pattern)
            );

            return cb.and(workspacePred, notDeleted, textPred);
        };
    }

    /**
     * Builds a Specification for combined AND filters:
     * workspaceId, isDeleted=false, optional status, tagIds, assignedTo, search text.
     */
    public static Specification<Contact> withFilters(ContactFilterRequest filters, UUID workspaceId) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("workspaceId"), workspaceId));
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (filters.status() != null) {
                predicates.add(cb.equal(root.get("status"), filters.status()));
            }

            if (filters.assignedTo() != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), filters.assignedTo()));
            }

            if (filters.tagIds() != null && !filters.tagIds().isEmpty()) {
                Join<Contact, Tag> tagJoin = root.join("tags", JoinType.INNER);
                predicates.add(tagJoin.get("id").in(filters.tagIds()));
                // Avoid duplicates when multiple tags match
                cq.distinct(true);
            }

            if (filters.search() != null && filters.search().length() >= 2) {
                String pattern = "%" + filters.search().toLowerCase() + "%";
                Join<Object, Object> company = root.join("company", JoinType.LEFT);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern),
                        cb.like(cb.lower(company.get("name")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
