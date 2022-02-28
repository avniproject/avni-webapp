package org.avni.dao;

import java.util.Date;
import org.avni.domain.AddressLevel;
import org.avni.domain.Individual;
import org.avni.domain.Program;
import org.joda.time.DateTime;
import org.avni.domain.ProgramEnrolment;
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

    Page<ProgramEnrolment> findByIndividualAddressLevelIdInAndProgramIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            List<Long> addressLevels,
            Long programId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    Page<ProgramEnrolment> findByIndividualFacilityIdAndProgramIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long programId,
            Date lastModifiedDateTime,
            Date now,
            Pageable pageable);

    boolean existsByProgramIdAndLastModifiedDateTimeGreaterThanAndIndividualAddressLevelIdIn(
            Long programId,
            Date lastModifiedDateTime,
            List<Long> addressIds);

    boolean existsByIndividualFacilityIdAndProgramIdAndLastModifiedDateTimeGreaterThan(
            long facilityId,
            Long programId,
            Date lastModifiedDateTime);

    @Query("select pe.program from ProgramEnrolment pe join pe.program join pe.program.operationalPrograms where pe.individual.id = :individualId and pe.programExitDateTime is null and pe.isVoided = false")
    List<Program> findActiveEnrolmentsByIndividualId(Long individualId);

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByProgramIdAndLastModifiedDateTimeGreaterThanAndIndividualAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsByIndividualFacilityIdAndProgramIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
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


    Page<ProgramEnrolment> findByLastModifiedDateTimeGreaterThanAndLastModifiedDateTimeLessThanAndProgramNameOrderByLastModifiedDateTimeAscIdAsc(
            Date lastModifiedDateTime,
            Date now,
            String program,
            Pageable pageable);

    Page<ProgramEnrolment> findByProgramNameAndIndividualUuidOrderByLastModifiedDateTimeAscIdAsc(
            String program,
            String individualUuid,
            Pageable pageable);

    @Query("select pe from ProgramEnrolment pe where pe.uuid =:id or pe.legacyId = :id")
    ProgramEnrolment findByLegacyIdOrUuid(String id);

    Page<ProgramEnrolment> findByLastModifiedDateTimeGreaterThanAndLastModifiedDateTimeLessThanOrderByLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date now,
            Pageable pageable);

    @Override
    default Page<ProgramEnrolment> syncByCatchment(SyncParameters syncParameters) {
        return findByIndividualAddressLevelIdInAndProgramIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }

    @Override
    default Page<ProgramEnrolment> syncByFacility(SyncParameters syncParameters) {
        return findByIndividualFacilityIdAndProgramIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), syncParameters.getLastModifiedDateTime().toDate(), syncParameters.getNow().toDate(), syncParameters.getPageable());
    }
}