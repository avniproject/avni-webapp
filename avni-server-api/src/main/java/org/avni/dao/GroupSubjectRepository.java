package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.GroupRole;
import org.avni.domain.GroupSubject;
import org.avni.domain.Individual;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
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

    Page<GroupSubject> findByGroupSubjectAddressLevelInAndMemberSubjectAddressLevelInAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> groupSubjectAddressLevels,
            List<AddressLevel> memberSubjectAddressLevels,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    Page<GroupSubject> findByGroupSubjectFacilityIdAndMemberSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long groupSubjectFacilityId,
            long memberSubjectFacilityId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable
    );

    boolean existsByGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThanAndGroupSubjectAddressLevelIdIn(
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime,
            List<Long> addressIds);


    boolean existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long groupSubjectTypeId,
            DateTime lastModifiedDateTime);

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }

    GroupSubject findByGroupSubjectAndMemberSubject(Individual groupSubject, Individual memberSubject);

    List<GroupSubject> findAllByGroupSubjectOrMemberSubject(Individual groupSubject, Individual memberSubject);

    GroupSubject findByGroupSubjectAndGroupRoleAndIsVoidedFalse(Individual groupSubject, GroupRole headOfHousehold);

    List<GroupSubject> findAllByGroupSubjectAndIsVoidedFalse(Individual groupSubject);

    List<GroupSubject> findAllByMemberSubjectAndGroupRoleIsVoidedFalseAndIsVoidedFalse(Individual memberSubject);

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

    Page<GroupSubject> findByGroupSubjectAddressLevelInAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels,
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

    @Override
    default Page<GroupSubject> syncByCatchment(SyncParameters syncParameters) {
        return findByGroupSubjectAddressLevelInAndMemberSubjectAddressLevelInAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<GroupSubject> syncByFacility(SyncParameters syncParameters) {
        return findByGroupSubjectFacilityIdAndMemberSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(syncParameters.getFacilityId(), syncParameters.getFacilityId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsByGroupRoleGroupSubjectTypeIdAndAuditLastModifiedDateTimeGreaterThanAndGroupSubjectAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    List<GroupSubject> findAllByMemberSubject(Individual memberSubject);
}
