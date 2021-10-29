package org.avni.dao;

import org.avni.domain.SubjectMigration;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SubjectMigrationRepository extends TransactionalDataRepository<SubjectMigration>, OperatingIndividualScopeAwareRepository<SubjectMigration> {

    @Override
    @Query("select sm from SubjectMigration sm " +
            "  inner join sm.oldAddressLevel.virtualCatchments ovc  " +
            "  inner join sm.newAddressLevel.virtualCatchments nvc " +
            "where (ovc.id = ?1 or nvc.id = ?1) " +
            "  and sm.individual.subjectType.id = ?4 " +
            "  and sm.audit.lastModifiedDateTime between ?2 and ?3 " +
            "order by sm.audit.lastModifiedDateTime, sm.id desc")
    Page<SubjectMigration> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable);

    @Override
    default Page<SubjectMigration> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        //Changes in facility not yet implemented for subject migration
        throw new UnsupportedOperationException();
    }

    @Override
    @Query("select case when count(sm) > 0 then true else false end " +
            "from SubjectMigration sm " +
            "where (sm.oldAddressLevel.id in ?1 or sm.newAddressLevel.id in ?1) " +
            "  and sm.individual.subjectType.id = ?3 " +
            "  and sm.audit.lastModifiedDateTime > ?2")
    boolean isEntityChangedForCatchment(List<Long> addressIds, DateTime lastModifiedDateTime, Long typeId);

    @Override
    default boolean isEntityChangedForFacility(long facilityId, DateTime lastModifiedDateTime, Long typeId) {
        throw new UnsupportedOperationException();
    }
}
