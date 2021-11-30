package org.avni.dao;

import org.avni.domain.*;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

import static org.springframework.data.jpa.domain.Specification.where;

@Repository
@RepositoryRestResource(collectionResourceRel = "programEncounter", path = "programEncounter", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface ProgramEncounterRepository extends TransactionalDataRepository<ProgramEncounter>, FindByLastModifiedDateTime<ProgramEncounter>, OperatingIndividualScopeAwareRepository<ProgramEncounter> {

    Page<ProgramEncounter> findByProgramEnrolmentIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    Page<ProgramEncounter> findByProgramEnrolmentIndividualFacilityIdAndEncounterTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long encounterTypeId, Date lastModifiedDateTime, Date now, Pageable pageable);

    boolean existsByEncounterTypeIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(
            Long encounterTypeId, Date lastModifiedDateTime, List<Long> addressIds);

    boolean existsByProgramEnrolmentIndividualFacilityIdAndEncounterTypeIdAndLastModifiedDateTimeGreaterThan(
            long catchmentId, Long encounterTypeId, Date lastModifiedDateTime);

    Page<ProgramEncounter> findByProgramEnrolmentIndividualAddressLevelIdInAndEncounterTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(List<Long> addressLevels, long encounterTypeId, Date lastModifiedDateTime, Date now, Pageable pageable);

    @Override
    default Page<ProgramEncounter> syncByCatchment(SyncParameters syncParameters) {
        return findByProgramEnrolmentIndividualAddressLevelIdInAndEncounterTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getAddressLevels(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default Page<ProgramEncounter> syncByFacility(SyncParameters syncParameters) {
        return findByProgramEnrolmentIndividualFacilityIdAndEncounterTypeIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(syncParameters.getCatchmentId(), syncParameters.getFilter(), CHSEntity.toDate(syncParameters.getLastModifiedDateTime()), CHSEntity.toDate(syncParameters.getNow()), syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(List<Long> addressIds, Date lastModifiedDateTime, Long typeId){
        return existsByEncounterTypeIdAndLastModifiedDateTimeGreaterThanAndProgramEnrolmentIndividualAddressLevelIdIn(typeId, lastModifiedDateTime, addressIds);
    }

    @Override
    default boolean isEntityChangedForFacility(long facilityId, Date lastModifiedDateTime, Long typeId){
        return existsByProgramEnrolmentIndividualFacilityIdAndEncounterTypeIdAndLastModifiedDateTimeGreaterThan(facilityId, typeId, lastModifiedDateTime);
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

    ProgramEncounter findByLegacyId(String legacyId);

    default Specification<ProgramEncounter> withProgramEncounterId(Long id) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
        {
            return id == null ? null : cb.equal(root.get("programEnrolment").get("id"), id);
        };
    }

    default Specification<ProgramEncounter> withProgramEncounterEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                earliestVisitDateTime == null ? null : cb.equal(root.get("earliestVisitDateTime").as(Date.class), earliestVisitDateTime.toDate());
    }

    default Specification<ProgramEncounter> withProgramEncounterDateTime(DateTime encounterDateTime) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterDateTime == null ? null : cb.equal(root.get("encounterDateTime").as(Date.class), encounterDateTime.toDate());
    }

    default Specification<ProgramEncounter> withNotNullEncounterDateTime() {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isNotNull(root.get("encounterDateTime"));
    }

    default Specification<ProgramEncounter> withVoidedFalse() {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isFalse(root.get("isVoided"));
    }

    default Specification<ProgramEncounter> withNotNullCancelDateTime() {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isNotNull(root.get("cancelDateTime"));
    }

    default Specification<ProgramEncounter> withProgramEncounterTypeIdUuids(List<String> encounterTypeUuids) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterTypeUuids.isEmpty() ? null : root.get("encounterType").get("uuid").in(encounterTypeUuids);
    }

    default Specification<ProgramEncounter> withEncounterType(EncounterType encounterType) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterType == null ? null :
                        cb.and(cb.equal(root.<ProgramEncounter, EncounterType>join("encounterType"), encounterType));
    }

    default Specification<ProgramEncounter> withProgramEnrolment(ProgramEnrolment programEnrolment) {
        return (Root<ProgramEncounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                programEnrolment == null ? null : cb.and(cb.equal(root.<ProgramEncounter, ProgramEnrolment>join("programEnrolment"), programEnrolment));
    }

    default Page<ProgramEncounter> search(SearchParams searchParams, Pageable pageable) {
        return findAll(where(lastModifiedBetween(searchParams.lastModifiedDateTime, searchParams.now))
                .and(withConceptValues(searchParams.concepts))
                .and(withEncounterType(searchParams.encounterType))
                .and(withProgramEnrolment(searchParams.programEnrolment)), pageable);
    }

    class SearchParams {
        public Date lastModifiedDateTime;
        public Date now;
        public Map<Concept, String> concepts;
        public EncounterType encounterType;
        public ProgramEnrolment programEnrolment;

        public SearchParams(Date lastModifiedDateTime, Date now, Map<Concept, String> conceptsMatchingValue, EncounterType encounterType, ProgramEnrolment programEnrolment) {
            this.lastModifiedDateTime = lastModifiedDateTime;
            if (lastModifiedDateTime == null) {
                this.lastModifiedDateTime = DateTime.parse("2000-01-01").toDate();
            }
            this.now = now;
            this.concepts = conceptsMatchingValue;
            this.encounterType = encounterType;
            this.programEnrolment = programEnrolment;
        }
    }
}
