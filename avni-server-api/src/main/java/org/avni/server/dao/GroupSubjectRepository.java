package org.avni.server.dao;

import java.util.stream.Stream;
import org.avni.server.domain.*;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.dao.sync.TransactionDataCriteriaBuilderUtil;
import org.joda.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

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

    @Query("select gs from Individual i " +
            "join GroupSubject gs on i = gs.memberSubject or i = gs.groupSubject " +
            "where i = :groupSubject")
    List<GroupSubject> findAllByGroupSubjectOrMemberSubject(Individual groupSubject);

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

    @Query("select gs from GroupSubject gs " +
            "join gs.groupSubject g " +
            "join gs.memberSubject m " +
            "where g.subjectType.id = :subjectTypeId " +
            "and g.isVoided = false " +
            "and m.isVoided = false " +
            "and g.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR g.addressLevel.id in :locationIds)")
    Stream<GroupSubject> findNonVoidedGroupSubjects(Long subjectTypeId, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime);

    @Query("select gs from GroupSubject gs " +
            "join gs.groupSubject g " +
            "join gs.memberSubject m " +
            "where g.subjectType.id = :subjectTypeId " +
            "and g.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR g.addressLevel.id in :locationIds)")
    Stream<GroupSubject> findAllGroupSubjects(Long subjectTypeId, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime);


    default Specification<GroupSubject> syncStrategySpecification(SyncParameters syncParameters) {
        return (Root<GroupSubject> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            SubjectType subjectType = syncParameters.getSubjectType();
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
                User user = UserContextHolder.getUserContext().getUser();
                Join<Object, Object> userGroupSubjectJoin = TransactionDataCriteriaBuilderUtil.joinUserSubjectAssignment(root.join("groupSubject"));
                Join<Object, Object> userMemberSubjectJoin = TransactionDataCriteriaBuilderUtil.joinUserSubjectAssignment(root.join("memberSubject"));
                predicates.add(cb.equal(userGroupSubjectJoin.get("user"), user));
                predicates.add(cb.equal(userGroupSubjectJoin.get("isVoided"), false));
                predicates.add(cb.equal(userMemberSubjectJoin.get("user"), user));
                predicates.add(cb.equal(userMemberSubjectJoin.get("isVoided"), false));
            }
            addSyncAttributeConceptPredicate(cb, predicates, root, syncParameters, "groupSubjectSyncConcept1Value", "groupSubjectSyncConcept2Value");
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

    @Modifying(clearAutomatically = true)
    @Query(value = "update group_subject gs set " +
            "group_subject_address_id = :addressId, " +
            "group_subject_sync_concept_1_value = :syncAttribute1Value, " +
            "group_subject_sync_concept_2_value = :syncAttribute2Value " +
            "where gs.group_subject_id = :individualId", nativeQuery = true)
    void updateSyncAttributesForGroupSubject(Long individualId, Long addressId, String syncAttribute1Value, String syncAttribute2Value);

    @Modifying(clearAutomatically = true)
    @Query(value = "update group_subject gs set " +
            "member_subject_address_id = :addressId " +
            "where gs.member_subject_id = :individualId", nativeQuery = true)
    void updateSyncAttributesForMemberSubject(Long individualId, Long addressId);

    @Modifying(clearAutomatically = true)
    @Query(value = "update group_subject gs set " +
            "group_subject_sync_concept_1_value = CAST((i.observations ->> CAST(:syncAttribute1 as text)) as text), " +
            "group_subject_sync_concept_2_value = CAST((i.observations ->> CAST(:syncAttribute2 as text)) as text) " +
            "from individual i " +
            "where gs.group_subject_id = i.id and i.subject_type_id = :subjectTypeId", nativeQuery = true)
    void updateConceptSyncAttributesForSubjectType(Long subjectTypeId, String syncAttribute1, String syncAttribute2);
}
