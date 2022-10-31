package org.avni.server.dao;

import org.avni.server.domain.Concept;
import org.avni.server.domain.Encounter;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Individual;
import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

@Repository
@RepositoryRestResource(collectionResourceRel = "encounter", path = "encounter", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface EncounterRepository extends TransactionalDataRepository<Encounter>, OperatingIndividualScopeAwareRepository<Encounter> {
    Page<Encounter> findByLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            Date lastModifiedDateTime, Date now, Pageable pageable);

    Page<Encounter> findByIndividualAddressLevelVirtualCatchmentsIdAndLastModifiedDateTimeIsBetweenOrderByLastModifiedDateTimeAscIdAsc(
            long catchmentId, Date lastModifiedDateTime, Date now, Pageable pageable);

    @Override
    default Page<Encounter> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                .and(syncTypeIdSpecification(syncParameters.getTypeId()))
                .and(syncStrategySpecification(syncParameters)),
        syncParameters.getPageable());
    }

    default Specification<Encounter> syncTypeIdSpecification(Long typeId) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                cb.equal(root.get("encounterType").get("id"), typeId);
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters){
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncTypeIdSpecification(syncParameters.getTypeId()))
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

    @Query(value = "select count(enc.id) as count " +
            "from encounter enc " +
            "join encounter_type t on t.id = enc.encounter_type_id " +
            "where t.uuid = :encounterTypeUUID and (enc.encounter_date_time notnull or enc.cancel_date_time notnull) " +
            "and ((enc.encounter_date_time BETWEEN :startDate and :endDate) or (enc.cancel_date_time BETWEEN :startDate and :endDate)) " +
            "group by enc.individual_id " +
            "order by count desc " +
            "limit 1", nativeQuery = true)
    Long getMaxEncounterCountBetween(String encounterTypeUUID, Calendar startDate, Calendar endDate);

    @Query(value = "select count(enc.id) as count " +
            "from encounter enc " +
            "join encounter_type t on t.id = enc.encounter_type_id " +
            "where t.uuid = :encounterTypeUUID and (enc.encounter_date_time notnull or enc.cancel_date_time notnull) " +
            "group by enc.individual_id " +
            "order by count desc " +
            "limit 1", nativeQuery = true)
    Long getMaxEncounterCount(String encounterTypeUUID);

    default Long getMaxEncounterCount(String encounterTypeUUID, Calendar startDate, Calendar endDate) {
        return startDate == null ? getMaxEncounterCount(encounterTypeUUID) :
                getMaxEncounterCountBetween(encounterTypeUUID, startDate, endDate);
    }

    @Query("select e from Encounter e where e.uuid =:id or e.legacyId = :id")
    Encounter findByLegacyIdOrUuid(String id);

    @Query("select e from Encounter e where e.legacyId = :id")
    Encounter findByLegacyId(String id);

    default Specification<Encounter> withIndividualId(Long id) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
        {
            return id == null ? null : cb.equal(root.get("individual").get("id"), id);
        };
    }

    default Specification<Encounter> withEncounterEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                earliestVisitDateTime == null ? null : cb.equal(root.get("earliestVisitDateTime").as(java.sql.Date.class), earliestVisitDateTime.toDate());
    }

    default Specification<Encounter> withEncounterDateTime(DateTime encounterDateTime) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterDateTime == null ? null : cb.equal(root.get("encounterDateTime").as(java.sql.Date.class), encounterDateTime.toDate());
    }

    default Specification<Encounter> withNotNullEncounterDateTime() {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isNotNull(root.get("encounterDateTime"));
    }

    default Specification<Encounter> withVoidedFalse() {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isFalse(root.get("isVoided"));
    }

    default Specification<Encounter> withNotNullCancelDateTime() {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> cb.isNotNull(root.get("cancelDateTime"));
    }

    default Specification<Encounter> withEncounterTypeIdUuids(List<String> encounterTypeUuids) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterTypeUuids.isEmpty() ? null : root.get("encounterType").get("uuid").in(encounterTypeUuids);
    }

    default Specification<Encounter> findByEncounterTypeSpec(String encounterType) {
        Specification<Encounter> spec = (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Encounter, EncounterType> encounterTypeJoin = root.join("encounterType", JoinType.LEFT);
            return cb.and(cb.equal(encounterTypeJoin.get("name"), encounterType));
        };
        return spec;
    }

    default Specification<Encounter> findBySubjectUUIDSpec(String subjectUUID) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Encounter, Individual> individualJoin = root.join("individual", JoinType.LEFT);
            return cb.and(cb.equal(individualJoin.get("uuid"), subjectUUID));
        };
    }

    default Page<Encounter> findByConcepts(Date lastModifiedDateTime, Date now, Map<Concept, String> concepts, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts, "observations")), pageable);
    }

    default Page<Encounter> findByConceptsAndEncounterType(Date lastModifiedDateTime, Date now, Map<Concept, String> concepts, String encounterType, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts, "observations"))
                .and(findByEncounterTypeSpec(encounterType)), pageable);
    }

    default Page<Encounter> findByConceptsAndEncounterTypeAndSubject(Date lastModifiedDateTime, Date now, Map<Concept, String> concepts, String encounterType, String subjectUUID, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts, "observations"))
                .and(findByEncounterTypeSpec(encounterType))
                .and(findBySubjectUUIDSpec(subjectUUID)), pageable);
    }

    @Modifying(clearAutomatically = true)
    @Query(value = "update encounter e set " +
            "address_id = :addressId, " +
            "sync_concept_1_value = :syncAttribute1Value, " +
            "sync_concept_2_value = :syncAttribute2Value " +
            "where e.individual_id = :individualId", nativeQuery = true)
    void updateSyncAttributesForIndividual(Long individualId, Long addressId, String syncAttribute1Value, String syncAttribute2Value);

    @Modifying(clearAutomatically = true)
    @Query(value = "update encounter e set " +
            "sync_concept_1_value = CAST((i.observations ->> CAST(:syncAttribute1 as text)) as text), " +
            "sync_concept_2_value = CAST((i.observations ->> CAST(:syncAttribute2 as text)) as text) " +
            "from individual i " +
            "where e.individual_id = i.id and i.subject_type_id = :subjectTypeId", nativeQuery = true)
    void updateConceptSyncAttributesForSubjectType(Long subjectTypeId, String syncAttribute1, String syncAttribute2);

}

