package org.avni.dao;

import java.util.Date;

import org.avni.domain.CHSEntity;
import org.avni.domain.SubjectMigration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubjectMigrationRepository extends TransactionalDataRepository<SubjectMigration>, OperatingIndividualScopeAwareRepository<SubjectMigration> {

    @Query("select sm from SubjectMigration sm " +
            "  inner join sm.oldAddressLevel.virtualCatchments ovc  " +
            "  inner join sm.newAddressLevel.virtualCatchments nvc " +
            "where (ovc.id = ?1 or nvc.id = ?1) " +
            "  and sm.individual.subjectType.id = ?4 " +
            "  and sm.lastModifiedDateTime between ?2 and ?3 " +
            "order by sm.lastModifiedDateTime, sm.id desc")
    Page<SubjectMigration> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, Date lastModifiedDateTime, Date now, Long filter, Pageable pageable);

    @Override
    @Query("select case when count(sm) > 0 then true else false end " +
            "from SubjectMigration sm " +
            "where (sm.oldAddressLevel.id in ?1 or sm.newAddressLevel.id in ?1) " +
            "  and sm.individual.subjectType.id = ?3 " +
            "  and sm.lastModifiedDateTime > ?2")
    boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId);

    @Override
    default Page<SubjectMigration> syncByCatchment(SyncParameters syncParameters) {
        return findByCatchmentIndividualOperatingScopeAndFilterByType(syncParameters.getCatchmentId(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getFilter(), syncParameters.getPageable());
    }

}
