package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.ProgramEncounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import java.util.Calendar;

@Repository
@RepositoryRestResource(collectionResourceRel = "programEncounter", path = "programEncounter", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface ProgramEncounterRepository extends TransactionalDataRepository<ProgramEncounter>, FindByLastModifiedDateTime<ProgramEncounter>, OperatingIndividualScopeAwareRepository<ProgramEncounter> {

    Page<ProgramEncounter> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<ProgramEncounter> findByProgramEnrolmentIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    @Override
    default Page<ProgramEncounter> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ProgramEncounter> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByProgramEnrolmentIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }

    @Query(value = "select count(enc.id) as count " +
            "from program_encounter enc " +
            "join encounter_type t on t.id = enc.encounter_type_id " +
            "where t.uuid = :programEncounterTypeUUID and (enc.encounter_date_time notnull or enc.cancel_date_time notnull) " +
            "and ((enc.encounter_date_time BETWEEN :startDate and :endDate) or (enc.cancel_date_time BETWEEN :startDate and :endDate)) " +
            "group by enc.program_enrolment_id " +
            "order by count desc " +
            "limit 1", nativeQuery = true)
    Long getMaxProgramEncounterCount(String programEncounterTypeUUID, Calendar startDate, Calendar endDate);
}