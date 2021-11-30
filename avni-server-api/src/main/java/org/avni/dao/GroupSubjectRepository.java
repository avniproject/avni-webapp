package org.avni.dao;

import org.avni.domain.*;
import org.joda.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

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

    Page<GroupSubject> findByGroupSubjectAddressLevelIdInAndMemberSubjectAddressLevelIdInAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> groupSubjectAddressLevels,
            List<Long> memberSubjectAddressLevels,
            Long groupSubjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    Page<GroupSubject> findByGroupSubjectFacilityIdAndMemberSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long groupSubjectFacilityId,
            long memberSubjectFacilityId,
            Long groupSubjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    boolean existsByGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndGroupSubjectAddressLevelIdIn(
            Long groupSubjectTypeId,
            Date lastModifiedDateTime,
            List<Long> addressIds);


    boolean existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long groupSubjectTypeId,
            Date lastModifiedDateTime);

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
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

    @Query("select gs from GroupSubject gs " +
            "join gs.groupSubject g " +
            "join gs.memberSubject m " +
            "where g.subjectType.uuid = :subjectTypeUUID " +
            "and g.isVoided = false " +
            "and m.isVoided = false " +
            "and g.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR g.addressLevel.id in :locationIds)")
    Page<GroupSubject> findGroupSubjects(String subjectTypeUUID, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime, Pageable pageable);

    Page<GroupSubject> findByGroupSubjectAddressLevelInAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels,
            Long groupSubjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    Page<GroupSubject> findByGroupSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long groupSubjectTypeId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable
    );

    @Override
    default Page<GroupSubject> syncByCatchment(SyncParameters syncParameters) {
        return findByGroupSubjectAddressLevelIdInAndMemberSubjectAddressLevelIdInAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getAddressLevels(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default Page<GroupSubject> syncByFacility(SyncParameters syncParameters) {
        return findByGroupSubjectFacilityIdAndMemberSubjectFacilityIdAndGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getFacilityId(), syncParameters.getFacilityId(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByGroupRoleGroupSubjectTypeIdAndLastModifiedDateTimeGreaterThanAndGroupSubjectAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    List<GroupSubject> findAllByMemberSubject(Individual memberSubject);
}
