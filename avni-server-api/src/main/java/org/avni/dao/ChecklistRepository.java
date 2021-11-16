package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.Checklist;
import org.avni.domain.Individual;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import org.joda.time.DateTime;
import java.util.List;
import java.util.Set;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistEntity", path = "txNewChecklistEntity", exported = false)
public interface ChecklistRepository extends TransactionalDataRepository<Checklist>, OperatingIndividualScopeAwareRepository<Checklist> {

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelInAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<AddressLevel> addressLevels, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Checklist> findByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId, Long checklistDetailId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    boolean existsByChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(
            Long checklistDetailId, DateTime lastModifiedDateTime, List<Long> addressIds);

    boolean existsByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndLastModifiedDateTimeGreaterThan(
            long facilityId, Long checklistDetailId, DateTime lastModifiedDateTime);

    Checklist findByProgramEnrolmentId(long programEnrolmentId);

    Set<Checklist> findByProgramEnrolmentIndividual(Individual individual);

    Checklist findByProgramEnrolmentUuidAndChecklistDetailName(String enrolmentUUID, String name);

    @Override
    default Page<Checklist> syncByCatchment(SyncParameters syncParameters) {
        return findByProgramEnrolmentIndividualAddressLevelInAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default Page<Checklist> syncByFacility(SyncParameters syncParameters) {
        return findByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime(), syncParameters.getNow(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId){
        return existsByChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId){
        return existsByProgramEnrolmentIndividualFacilityIdAndChecklistDetailIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
    }
}
