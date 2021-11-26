package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.ChecklistItem;
import org.avni.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistItemEntity", path = "txNewChecklistItemEntity", exported = false)
public interface ChecklistItemRepository extends TransactionalDataRepository<ChecklistItem>, OperatingIndividualScopeAwareRepository<ChecklistItem> {

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualAddressLevelInAndChecklistChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels, Long checklistDetailId, Date lastModifiedDateTime, Date now, Pageable pageable);

    Page<ChecklistItem> findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long checklistDetailId, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByChecklistChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndChecklistProgramEnrolmentIndividualAddressLevelIdIn(
            Long checklistDetailId, Date lastModifiedDateTime, List<Long> addressIds);

    boolean existsByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndLastModifiedDateTimeGreaterThan(
            long catchmentId, Long checklistDetailId, Date lastModifiedDateTime);

    ChecklistItem findByChecklistUuidAndChecklistItemDetailUuid(String checklistUUID, String checklistItemDetailUUID);

    Set<ChecklistItem> findByChecklistProgramEnrolmentIndividual(Individual individual);

    @Override
    default Page<ChecklistItem> syncByCatchment(SyncParameters syncParameters) {
        return findByChecklistProgramEnrolmentIndividualAddressLevelInAndChecklistChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default Page<ChecklistItem> syncByFacility(SyncParameters syncParameters) {
        return findByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByChecklistChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndChecklistProgramEnrolmentIndividualAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsByChecklistProgramEnrolmentIndividualFacilityIdAndChecklistChecklistDetailIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
