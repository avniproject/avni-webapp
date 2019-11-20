package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Program;
import org.openchs.domain.ProgramEnrolment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "programEnrolment", path = "programEnrolment", exported = false)
public interface ProgramEnrolmentRepository extends TransactionalDataRepository<ProgramEnrolment>, FindByLastModifiedDateTime<ProgramEnrolment>, OperatingIndividualScopeAwareRepository<ProgramEnrolment> {
    Page<ProgramEnrolment> findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<ProgramEnrolment> findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    List<ProgramEnrolment> findByProgram(Program program);

    @Override
    default Page<ProgramEnrolment> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ProgramEnrolment> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }

    @Query("select enl from ProgramEnrolment enl " +
            "where enl.isVoided = false and " +
            "enl.individual.isVoided = false ")
    Page<ProgramEnrolment> findEnrolments(Pageable pageable);
}