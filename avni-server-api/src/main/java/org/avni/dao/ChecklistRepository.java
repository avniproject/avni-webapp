package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.Checklist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistEntity", path = "txNewChecklistEntity", exported = false)
public interface ChecklistRepository extends TransactionalDataRepository<Checklist>, OperatingIndividualScopeAwareRepository<Checklist> {

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Checklist> findByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    boolean existsByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(
            long catchmentId, Long checklistDetailId, DateTime lastModifiedDateTime);

    boolean existsByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(
            long facilityId, Long checklistDetailId, DateTime lastModifiedDateTime);

    Checklist findByProgramEnrolmentId(long programEnrolmentId);

    Checklist findByProgramEnrolmentUuidAndChecklistDetailName(String enrolmentUUID, String name);

    @Override
    default Page<Checklist> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Checklist> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default boolean isEntityChangedForCatchment(long catchmentId, DateTime lastModifiedDateTime, Long typeId){
        return existsByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(catchmentId, typeId, lastModifiedDateTime);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndAuditLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
