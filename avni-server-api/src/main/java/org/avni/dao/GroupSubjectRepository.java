package org.avni.dao;

import org.avni.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Date;

@Repository
@RepositoryRestResource(collectionResourceRel = "groupSubject", path = "groupSubject", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface GroupSubjectRepository extends TransactionalDataRepository<GroupSubject>, FindByLastModifiedDateTime<GroupSubject>, OperatingIndividualScopeAwareRepository<GroupSubject> {
    default GroupSubject findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupSubject");
    }

    default GroupSubject findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in GroupSubject");
    }

    GroupSubject findByGroupSubjectAndMemberSubject(Individual groupSubject, Individual memberSubject);

    List<GroupSubject> findAllByGroupSubjectOrMemberSubject(Individual groupSubject, Individual memberSubject);

    GroupSubject findByGroupSubjectAndGroupRoleAndIsVoidedFalse(Individual groupSubject, GroupRole headOfHousehold);

    List<GroupSubject> findAllByGroupSubjectAndIsVoidedFalse(Individual groupSubject);

    List<GroupSubject> findAllByMemberSubjectAndGroupRoleIsVoidedFalseAndIsVoidedFalse(Individual memberSubject);

    List<GroupSubject> findAllByMemberSubjectIn(List<Individual> memberSubjects);

    Page<GroupSubject> findByGroupSubjectUuidOrderByLastModifiedDateTimeAscIdAsc(
            String groupSubjectUUID,
            Pageable pageable
    );

    Page<GroupSubject> findByMemberSubjectUuidOrderByLastModifiedDateTimeAscIdAsc(
            String memberSubjectUUID,
            Pageable pageable
    );

    default Specification<GroupSubject> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<GroupSubject> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            SubjectType subjectType = syncParameters.getSubjectType();
            JsonObject syncSettings = syncParameters.getSyncSettings();
            Join<GroupSubject, GroupRole> groupRole = root.join("groupRole", JoinType.LEFT);
            predicates.add(cb.equal(groupRole.get("groupSubjectType").get("id"), syncParameters.getTypeId()));
            if (subjectType.isShouldSyncByLocation()) {
                List<Long> addressLevels = syncParameters.getAddressLevels();
                if (addressLevels.size() > 0) {
                    CriteriaBuilder.In<Long> inClause1 = cb.in(root.get("groupSubjectAddressId"));
                    CriteriaBuilder.In<Long> inClause2 = cb.in(root.get("memberSubjectAddressId"));
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
                    CriteriaBuilder.In<Integer> inClause1 = cb.in(root.get("groupSubject").get("id"));
                    CriteriaBuilder.In<Integer> inClause2 = cb.in(root.get("memberSubject").get("id"));
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
            if (subjectType.isSyncRegistrationConcept1Usable()) {
                String syncConcept1 = (String) syncSettings.getOrDefault(User.SyncSettingKeys.syncConcept1.name(), "");
                predicates.add(cb.equal(root.get("groupSubjectSyncConcept1Value"), cb.literal(syncConcept1)));
            }
            if (subjectType.isSyncRegistrationConcept2Usable()) {
                String syncConcept2 = (String) syncSettings.getOrDefault(User.SyncSettingKeys.syncConcept2.name(), "");
                predicates.add(cb.equal(root.get("groupSubjectSyncConcept2Value"), cb.literal(syncConcept2)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    default Page<GroupSubject> getSyncResults(SyncParameters syncParameters) {
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

    List<GroupSubject> findAllByMemberSubject(Individual memberSubject);
}
