package org.avni.server.dao;

import org.avni.server.domain.Checklist;
import org.avni.server.domain.ChecklistItem;
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
@RepositoryRestResource(collectionResourceRel = "txNewChecklistItemEntity", path = "txNewChecklistItemEntity", exported = false)
public interface ChecklistItemRepository extends TransactionalDataRepository<ChecklistItem>, OperatingIndividualScopeAwareRepository<ChecklistItem> {

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    ChecklistItem findByChecklistUuidAndChecklistItemDetailUuid(String checklistUUID, String checklistItemDetailUUID);

    Set<ChecklistItem> findByChecklistProgramEnrolmentIndividual(Individual individual);

    @Override
    default Page<ChecklistItem> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

    default Specification<ChecklistItem> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<ChecklistItem> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Join<ChecklistItem, Checklist> checklistJoin = root.join("checklist", JoinType.LEFT);
            Join<Checklist, ProgramEnrolment> programEnrolmentJoin = checklistJoin.join("programEnrolment");
            predicates.add(cb.equal(checklistJoin.get("checklistDetail").get("id"), syncParameters.getTypeId()));
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
