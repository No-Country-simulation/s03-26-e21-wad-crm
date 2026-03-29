package com.crm.module.deal.repository;

import com.crm.module.deal.entity.Deal;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class DealSpecification {

    private DealSpecification() {}

    /**
     * Builds a Specification for listing active deals with optional filters.
     * Always filters by workspaceId and deleted=false. Req 17.1, 17.4
     */
    public static Specification<Deal> withFilters(UUID workspaceId, UUID stageId, UUID assignedTo, UUID contactId) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("workspaceId"), workspaceId));
            predicates.add(cb.isFalse(root.get("deleted")));

            if (stageId != null) {
                predicates.add(cb.equal(root.get("stage").get("id"), stageId));
            }
            if (assignedTo != null) {
                predicates.add(cb.equal(root.get("assignedTo"), assignedTo));
            }
            if (contactId != null) {
                predicates.add(cb.equal(root.get("contactId"), contactId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
