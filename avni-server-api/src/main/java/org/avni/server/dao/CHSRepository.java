package org.avni.server.dao;

import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.Concept;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@NoRepositoryBean
public interface CHSRepository<T extends CHSEntity> extends CrudRepository<T, Long> {
    T findByUuid(String uuid);
    List<T> findAll();
    List<T> findAllByIsVoidedFalse();

    default T findEntity(Long id) {
        if (id == null) return null;
        return findById(id).orElse(null);
    }

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

    default Expression<String> convertToDate(Path<?> path, CriteriaBuilder cb) {
        return cb.function("TO_CHAR", String.class, path, cb.literal("yyyy-MM-dd"));
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

    default Specification withConceptValues(Map<Concept, String> concepts, String observationField) {
        Specification<T> spec = (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            concepts.forEach((concept, value) -> {
                predicates.add(cb.equal(jsonExtractPathText(root.get(observationField), concept.getUuid(), cb), value));
            });

            return cb.and(predicates.toArray(new Predicate[predicates.size()]));
        };
        return spec;
    }

    default void voidEntity(Long id) {
        T entity = this.findEntity(id);
        entity.setVoided(true);
        this.save(entity);
    }
}
