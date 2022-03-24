package org.avni.dao;

import org.avni.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.security.access.prepost.PreAuthorize;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@NoRepositoryBean
@PreAuthorize(value = "hasAnyAuthority('user')")
public interface TransactionalDataRepository<T extends CHSEntity> extends CHSRepository<T>, JpaRepository<T, Long>, JpaSpecificationExecutor<T> {
    default T findOne(Long id) {
        return findById(id).orElse(null);
    }

    default Specification<T> syncAuditSpecification(SyncParameters syncParameters) {
        Date lastModifiedDateTime = syncParameters.getLastModifiedDateTime().toDate();
        Date now = syncParameters.getNow().toDate();
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.between(root.get("lastModifiedDateTime"), cb.literal(lastModifiedDateTime), cb.literal(now)));
            query.orderBy(cb.asc(root.get("lastModifiedDateTime")), cb.asc(root.get("id")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    default Specification<T> syncEntityChangedAuditSpecification(SyncParameters syncParameters) {
        Date lastModifiedDateTime = syncParameters.getLastModifiedDateTime().toDate();
        return (Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.greaterThan(root.get("lastModifiedDateTime"), cb.literal(lastModifiedDateTime)));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    default <A extends CHSEntity> Specification<A> syncStrategySpecification(SyncParameters syncParameters, boolean isIndividual, boolean isEnrolmentOrEncounter) {
        return (Root<A> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            addSyncStrategyPredicates(syncParameters, cb, predicates, root, isIndividual, isEnrolmentOrEncounter);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    default <A extends CHSEntity, B extends CHSEntity> void addSyncStrategyPredicates(SyncParameters syncParameters,
                                                                                      CriteriaBuilder cb,
                                                                                      List<Predicate> predicates,
                                                                                      From<A, B> from,
                                                                                      boolean isIndividual,
                                                                                      boolean isEnrolmentOrEncounter) {
        SubjectType subjectType = syncParameters.getSubjectType();
        JsonObject syncSettings = syncParameters.getSyncSettings();
        if (subjectType.isShouldSyncByLocation()) {
            List<Long> addressLevels = syncParameters.getAddressLevels();
            if (addressLevels.size() > 0) {
                CriteriaBuilder.In<Long> inClause;
                if (isIndividual) {
                    inClause = cb.in(from.get("addressLevel").get("id"));
                } else {
                    inClause = cb.in(from.get("addressId"));
                }
                for (Long id : addressLevels) {
                    inClause.value(id);
                }
                predicates.add(inClause);
            } else {
                predicates.add(cb.equal(from.get("id"), cb.literal(0)));
            }
        }
        if (subjectType.isDirectlyAssignable()) {
            List<Integer> subjectIds = (List<Integer>) syncSettings.getOrDefault(User.SyncSettingKeys.subjectIds.name(), Collections.EMPTY_LIST);
            if (subjectIds.size() > 0) {
                CriteriaBuilder.In<Integer> inClause;
                if (isIndividual) {
                    inClause = cb.in(from.get("id"));
                } else if (isEnrolmentOrEncounter) {
                    inClause = cb.in(from.get("individual").get("id"));
                } else {
                    inClause = cb.in(from.get("individualId"));
                }
                for (Integer id : subjectIds) {
                    inClause.value(id);
                }
                predicates.add(inClause);
            } else {
                predicates.add(cb.equal(from.get("id"), cb.literal(0)));
            }
        }
        if (subjectType.isSyncRegistrationConcept1Usable()) {
            String syncConcept1 = (String) syncSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), "");
            predicates.add(cb.equal(from.get("syncConcept1Value"), cb.literal(syncConcept1)));
        }
        if (subjectType.isSyncRegistrationConcept2Usable()) {
            String syncConcept2 = (String) syncSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), "");
            predicates.add(cb.equal(from.get("syncConcept2Value"), cb.literal(syncConcept2)));
        }
    }
}
