package org.avni.dao;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.avni.application.Subject;
import org.avni.domain.GroupRole;
import org.avni.domain.GroupSubject;
import org.avni.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

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

    Page<GroupSubject> findByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    Page<GroupSubject> findByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    boolean existsByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(
            long catchmentId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime);

    boolean existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime);

    @Override
    default Page<GroupSubject> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<GroupSubject> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default boolean isEntityChangedForCatchment(long catchmentId, DateTime lastModifiedDateTime, Long typeId){
        return existsByGroupSubjectAddressLevelVirtualCatchmentsIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(catchmentId, typeId, lastModifiedDateTime);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }

    GroupSubject findByGroupSubjectAndMemberSubject(Individual groupSubject, Individual memberSubject);

    GroupSubject findByGroupSubjectAndGroupRoleAndIsVoidedFalse(Individual groupSubject, GroupRole headOfHousehold);

    List<GroupSubject> findAllByGroupSubjectAndIsVoidedFalse(Individual groupSubject);

    List<GroupSubject> findAllByMemberSubjectAndIsVoidedFalse(Individual memberSubject);

    List<GroupSubject> findAllByMemberSubjectIn(List<Individual> memberSubjects);

    Page<GroupSubject> findByGroupSubjectUuidOrderByAuditLastModifiedDateTimeAscIdAsc(
            String groupSubjectUUID,
            Pageable pageable
    );

    Page<GroupSubject> findByMemberSubjectUuidOrderByAuditLastModifiedDateTimeAscIdAsc(
            String memberSubjectUUID,
            Pageable pageable
    );

    @Query("select gs from GroupSubject gs " +
            "join gs.groupSubject g " +
            "join gs.memberSubject m " +
            "where g.subjectType.uuid = :subjectTypeUUID " +
            "and g.isVoided = false " +
            "and m.isVoided = false " +
            "and g.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR g.addressLevel.id in :locationIds)")
    Page<GroupSubject> findGroupSubjects(String subjectTypeUUID, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime, Pageable pageable);
}
