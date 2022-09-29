package org.avni.server.dao;

import java.util.ArrayList;

import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectMigration;
import org.avni.server.domain.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.List;

@Repository
public interface SubjectMigrationRepository extends TransactionalDataRepository<SubjectMigration>, OperatingIndividualScopeAwareRepository<SubjectMigration> {

    default Specification<SubjectMigration> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<SubjectMigration> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            SubjectType subjectType = syncParameters.getSubjectType();
            Join<SubjectMigration, Individual> individualJoin = root.join("individual", JoinType.LEFT);
            predicates.add(cb.equal(individualJoin.get("subjectType").get("id"), syncParameters.getTypeId()));
            if (subjectType.isShouldSyncByLocation()) {
                List<Long> addressLevels = syncParameters.getAddressLevels();
                if (addressLevels.size() > 0) {
                    CriteriaBuilder.In<Long> inClause1 = cb.in(root.get("oldAddressLevel").get("id"));
                    CriteriaBuilder.In<Long> inClause2 = cb.in(root.get("newAddressLevel").get("id"));
                    for (Long id : addressLevels) {
                        inClause1.value(id);
                        inClause2.value(id);
                    }
                    predicates.add(inClause1);
                    predicates.add(inClause2);
                } else {
                    predicates.add(cb.equal(root.get("id"), cb.literal(0)));
                }
            }
            addSyncAttributeConceptPredicate(cb, predicates, root, syncParameters, "newSyncConcept1Value", "newSyncConcept2Value");
            addSyncAttributeConceptPredicate(cb, predicates, root, syncParameters, "oldSyncConcept1Value", "oldSyncConcept2Value");
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters) {
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

    @Override
    default Page<SubjectMigration> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

}
