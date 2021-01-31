package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Audit;
import org.openchs.domain.CHSEntity;
import org.openchs.domain.Concept;
import org.openchs.domain.Individual;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
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

    default Specification<T> findByConceptsSpec(DateTime lastModifiedDateTime, DateTime now, Map<Concept, String> concepts) {

        Specification<T> spec = (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<T, Audit> audit = root.join("audit", JoinType.LEFT);

            List<Predicate> predicates = new ArrayList<>();
            concepts.forEach((concept, value) -> {
                predicates.add(cb.equal(jsonExtractPathText(root.get("observations"), concept.getUuid(), cb), value));
            });

            predicates.add(cb.between(audit.get("lastModifiedDateTime"), cb.literal(lastModifiedDateTime), cb.literal(now)));
            query.orderBy(cb.asc(audit.get("lastModifiedDateTime")), cb.asc(root.get("id")));

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return spec;
    }
}