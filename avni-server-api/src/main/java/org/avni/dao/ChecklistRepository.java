package org.avni.dao;

import org.avni.domain.AddressLevel;
import org.avni.domain.Checklist;
import org.avni.domain.Individual;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Repository
@RepositoryRestResource(collectionResourceRel = "txNewChecklistEntity", path = "txNewChecklistEntity", exported = false)
public interface ChecklistRepository extends TransactionalDataRepository<Checklist>, OperatingIndividualScopeAwareRepository<Checklist> {

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    Page<Checklist> findByProgramEnrolmentIndividualAddressLevelIdInAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> addressLevels, Long checklistDetailId, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(
            Long checklistDetailId, Date lastModifiedDateTime, List<Long> addressIds);

    Checklist findByProgramEnrolmentId(long programEnrolmentId);

    Set<Checklist> findByProgramEnrolmentIndividual(Individual individual);

    Checklist findByProgramEnrolmentUuidAndChecklistDetailName(String enrolmentUUID, String name);

    @Override
    default Page<Checklist> syncByCatchment(SyncParameters syncParameters) {
        return findByProgramEnrolmentIndividualAddressLevelIdInAndChecklistDetailIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByChecklistDetailIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

}
