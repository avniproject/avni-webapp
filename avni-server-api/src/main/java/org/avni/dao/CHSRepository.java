package org.avni.dao;

import org.avni.domain.CHSEntity;
import org.avni.domain.Concept;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface CHSRepository<T extends CHSEntity> {
    T findByUuid(String uuid);
    List<T> findAll();
    List<T> findAllByIsVoidedFalse();

    default Predicate jsonContains(Path<?> jsonb, String pattern, CriteriaBuilder builder) {
        return builder.isTrue(builder.function("jsonb_object_values_contain", Boolean.class,
                jsonb, builder.literal(pattern)));
    }

    default Expression<String> jsonExtractPathText(Path<?> jsonb, String key, CriteriaBuilder builder) {
        return builder.function("jsonb_extract_path_text",
                String.class,
                jsonb,
                builder.literal(key)
        );
    }

    default Specification lastModifiedBetween(Date lastModifiedDateTime, Date now) {
        Specification<T> spec = (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (lastModifiedDateTime != null) {
                predicates.add(cb.greaterThan(root.get("lastModifiedDateTime"), cb.literal(lastModifiedDateTime)));
                predicates.add(cb.lessThan(root.get("lastModifiedDateTime"), cb.literal(now)));
                query.orderBy(cb.asc(root.get("lastModifiedDateTime")), cb.asc(root.get("id")));
            }

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return spec;
    }

    default Specification withConceptValues(Map<Concept, String> concepts) {
        Specification<T> spec = (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            concepts.forEach((concept, value) -> {
                predicates.add(cb.equal(jsonExtractPathText(root.get("observations"), concept.getUuid(), cb), value));
            });

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return spec;
    }
}
