package org.avni.dao.individualRelationship;

import java.util.*;

import org.avni.dao.FindByLastModifiedDateTime;
import org.avni.dao.OperatingIndividualScopeAwareRepository;
import org.avni.dao.SyncParameters;
import org.avni.dao.TransactionalDataRepository;
import org.avni.domain.*;
import org.avni.domain.individualRelationship.IndividualRelationship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;

@Repository
@RepositoryRestResource(collectionResourceRel = "individualRelationship", path = "individualRelationship", exported = false)
public interface IndividualRelationshipRepository extends TransactionalDataRepository<IndividualRelationship>, FindByLastModifiedDateTime<IndividualRelationship>, OperatingIndividualScopeAwareRepository<IndividualRelationship> {
    Page<IndividualRelationship> findByIndividualaAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    @Query(value = "select ir from IndividualRelationship ir where ir.individuala = :individual or ir.individualB = :individual")
    Set<IndividualRelationship> findByIndividual(Individual individual);

    default Specification<IndividualRelationship> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<IndividualRelationship> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            SubjectType subjectType = syncParameters.getSubjectType();
            JsonObject syncSettings = syncParameters.getSyncSettings();
            Join<IndividualRelationship, Individual> individualAJoin = root.join("individuala", JoinType.LEFT);
            Join<IndividualRelationship, Individual> individualBJoin = root.join("individualB", JoinType.LEFT);
            predicates.add(cb.equal(individualAJoin.get("subjectType").get("id"), syncParameters.getTypeId()));
            if (subjectType.isShouldSyncByLocation()) {
                List<Long> addressLevels = syncParameters.getAddressLevels();
                if (addressLevels.size() > 0) {
                    CriteriaBuilder.In<Long> inClause1 = cb.in(individualAJoin.get("addressLevel").get("id"));
                    CriteriaBuilder.In<Long> inClause2 = cb.in(individualBJoin.get("addressLevel").get("id"));
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
            if (subjectType.isDirectlyAssignable()) {
                List<Integer> subjectIds = (List<Integer>) syncSettings.getOrDefault(User.SyncSettingKeys.subjectIds.name(), Collections.EMPTY_LIST);
                if (subjectIds.size() > 0) {
                    CriteriaBuilder.In<Integer> inClause1 = cb.in(individualAJoin.get("id"));
                    CriteriaBuilder.In<Integer> inClause2 = cb.in(individualBJoin.get("id"));
                    for (Integer id : subjectIds) {
                        inClause1.value(id);
                        inClause2.value(id);
                    }
                    predicates.add(inClause1);
                    predicates.add(inClause2);
                } else {
                    predicates.add(cb.equal(root.get("id"), cb.literal(0)));
                }
            }
            addSyncAttributeConceptPredicate(cb, predicates, individualAJoin, syncParameters, "syncConcept1Value", "syncConcept2Value");
            addSyncAttributeConceptPredicate(cb, predicates, individualBJoin, syncParameters, "syncConcept1Value", "syncConcept2Value");
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    default Page<IndividualRelationship> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters) {
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

    List<IndividualRelationship> findByIndividualaAndIndividualBAndIsVoidedFalse(Individual individualA, Individual individualB);
}
