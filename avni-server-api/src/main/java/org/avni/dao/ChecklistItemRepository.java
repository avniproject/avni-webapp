package org.avni.dao;

import org.avni.domain.Individual;
import org.joda.time.DateTime;
import org.avni.domain.ChecklistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistItemEntity", path = "txNewChecklistItemEntity", exported = false)
public interface ChecklistItemRepository extends TransactionalDataRepository<ChecklistItem>, OperatingIndividualScopeAwareRepository<ChecklistItem> {

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    boolean existsByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime);

    boolean existsByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime);

    ChecklistItem findByChecklistUuidAndChecklistItemDetailUuid(String checklistUUID, String checklistItemDetailUUID);

    Set<ChecklistItem> findByChecklistProgramEnrolmentIndividual(Individual individual);

    @Override
    default Page<ChecklistItem> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ChecklistItem> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default boolean isEntityChangedForCatchment(long catchmentId, DateTime lastModifiedDateTime, Long typeId){
        return existsByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(catchmentId, typeId, lastModifiedDateTime);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
