package org.avni.server.dao.individualRelationship;

import java.util.*;

import org.avni.server.dao.FindByLastModifiedDateTime;
import org.avni.server.dao.OperatingIndividualScopeAwareRepository;
import org.avni.server.dao.SyncParameters;
import org.avni.server.dao.TransactionalDataRepository;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.domain.User;
import org.avni.server.domain.individualRelationship.IndividualRelationship;
import org.avni.server.framework.security.UserContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;

import static org.avni.server.dao.sync.TransactionDataCriteriaBuilderUtil.joinUserSubjectAssignment;

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
            Join<IndividualRelationship, Individual> individualAJoin = root.join("individuala");
            Join<IndividualRelationship, Individual> individualBJoin = root.join("individualB");
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
                User user = UserContextHolder.getUserContext().getUser();
                Join<Object, Object> userSubjectAAssignmentJoin = joinUserSubjectAssignment(individualAJoin);
                Join<Object, Object> userSubjectBAssignmentJoin = joinUserSubjectAssignment(individualBJoin);
                predicates.add(cb.equal(userSubjectAAssignmentJoin.get("user"), user));
                predicates.add(cb.equal(userSubjectAAssignmentJoin.get("isVoided"), false));
                predicates.add(cb.equal(userSubjectBAssignmentJoin.get("user"), user));
                predicates.add(cb.equal(userSubjectBAssignmentJoin.get("isVoided"), false));
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
