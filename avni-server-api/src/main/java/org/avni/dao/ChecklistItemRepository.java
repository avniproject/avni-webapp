package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.ChecklistItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistItemEntity", path = "txNewChecklistItemEntity", exported = false)
public interface ChecklistItemRepository extends TransactionalDataRepository<ChecklistItem>, OperatingIndividualScopeAwareRepository<ChecklistItem> {

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    ChecklistItem findByChecklistUuidAndChecklistItemDetailUuid(String checklistUUID, String checklistItemDetailUUID);

    @Override
    default Page<ChecklistItem> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ChecklistItem> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }
}
