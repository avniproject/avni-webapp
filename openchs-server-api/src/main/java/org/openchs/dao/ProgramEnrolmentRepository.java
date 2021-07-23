package org.openchs.dao;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.domain.ProgramEnrolment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "programEnrolment", path = "programEnrolment", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface ProgramEnrolmentRepository extends TransactionalDataRepository<ProgramEnrolment>, FindByLastModifiedDateTime<ProgramEnrolment>, OperatingIndividualScopeAwareRepository<ProgramEnrolment> {

    Page<ProgramEnrolment> findByIndividualAddressLevelVirtualCatchmentsIdAndProgramIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Long programId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<ProgramEnrolment> findByIndividualFacilityIdAndProgramIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long programId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    @Override
    default Page<ProgramEnrolment> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualAddressLevelVirtualCatchmentsIdAndProgramIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ProgramEnrolment> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualFacilityIdAndProgramIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    @Query("select enl from ProgramEnrolment enl " +
            "join enl.individual i " +
            "where enl.program.uuid = :programUUID " +
            "and enl.isVoided = false " +
            "and i.isVoided = false " +
            "and coalesce(enl.enrolmentDateTime, enl.programExitDateTime) between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR i.addressLevel.id in :locationIds)")
    Page<ProgramEnrolment> findEnrolments(String programUUID, List<Long> locationIds, DateTime startDateTime, DateTime endDateTime, Pageable pageable);

    //group by is added for distinct enl records
    @Query("select enl from ProgramEnrolment enl " +
            "join enl.programEncounters enc " +
            "join enl.individual i " +
            "where enc.encounterType.uuid = :encounterTypeUUID " +
            "and enl.program.uuid = :programUUID " +
            "and enc.isVoided = false " +
            "and enl.isVoided = false " +
            "and i.isVoided = false " +
            "and coalesce(enc.encounterDateTime, enc.cancelDateTime) between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR i.addressLevel.id in :locationIds) " +
            "group by enl.id")
    Page<ProgramEnrolment> findProgramEncounters(List<Long> locationIds, DateTime startDateTime, DateTime endDateTime, String encounterTypeUUID, String programUUID, Pageable pageable);


    Page<ProgramEnrolment> findByAuditLastModifiedDateTimeGreaterThanAndAuditLastModifiedDateTimeLessThanAndProgramNameOrderByAuditLastModifiedDateTimeAscIdAsc(
            DateTime lastModifiedDateTime,
            DateTime now,
            String program,
            Pageable pageable);

    Page<ProgramEnrolment> findByProgramNameAndIndividualUuidOrderByAuditLastModifiedDateTimeAscIdAsc(
            String program,
            String individualUuid,
            Pageable pageable);

    ProgramEnrolment findByLegacyId(String legacyId);

    Page<ProgramEnrolment> findByAuditLastModifiedDateTimeGreaterThanAndAuditLastModifiedDateTimeLessThanOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);
}
