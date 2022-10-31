package org.avni.server.dao;

import org.avni.server.domain.Checklist;
import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.Individual;
import org.avni.server.domain.ProgramEnrolment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.*;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistEntity", path = "txNewChecklistEntity", exported = false)
public interface ChecklistRepository extends TransactionalDataRepository<Checklist>, OperatingIndividualScopeAwareRepository<Checklist> {

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    Checklist findByProgramEnrolmentId(long programEnrolmentId);

    Set<Checklist> findByProgramEnrolmentIndividual(Individual individual);

    Checklist findByProgramEnrolmentUuidAndChecklistDetailName(String enrolmentUUID, String name);

    Checklist findFirstByChecklistDetail(ChecklistDetail checklistDetail);

    @Override
    default Page<Checklist> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

    default Specification<Checklist> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<Checklist> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<Checklist, ProgramEnrolment> programEnrolmentJoin = root.join("programEnrolment");
            predicates.add(cb.equal(root.get("checklistDetail").get("id"), syncParameters.getTypeId()));
            addSyncStrategyPredicates(syncParameters, cb, predicates, programEnrolmentJoin);
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters){
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

}
