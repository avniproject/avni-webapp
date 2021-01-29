package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Audit;
import org.openchs.domain.Encounter;
import org.openchs.domain.EncounterType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.sql.Date;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Map;

@Repository
@RepositoryRestResource(collectionResourceRel = "encounter", path = "encounter", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface EncounterRepository extends TransactionalDataRepository<Encounter>, OperatingIndividualScopeAwareRepository<Encounter>, OperatingIndividualScopeAwareRepositoryWithTypeFilter<Encounter> {
    Page<Encounter> findByAuditLastModifiedDateTimeIsBetweenOrderByAudit_LastModifiedDateTimeAscIdAsc(
            DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByAuditLastModifiedDateTimeIsBetweenAndEncounterTypeNameOrderByAudit_LastModifiedDateTimeAscIdAsc(
            DateTime lastModifiedDateTime, DateTime now, String encounterType, Pageable pageable);

    Page<Encounter> findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByIndividualAddressLevelVirtualCatchmentsIdAndEncounterTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, Long encounterTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByIndividualFacilityIdAndEncounterTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, Long encounterTypeId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    @Override
    default Page<Encounter> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Encounter> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Encounter> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualAddressLevelVirtualCatchmentsIdAndEncounterTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Encounter> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByIndividualFacilityIdAndEncounterTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    @Query(value = "select count(enc.id) as count " +
            "from encounter enc " +
            "join encounter_type t on t.id = enc.encounter_type_id " +
            "where t.uuid = :encounterTypeUUID and (enc.encounter_date_time notnull or enc.cancel_date_time notnull) " +
            "and ((enc.encounter_date_time BETWEEN :startDate and :endDate) or (enc.cancel_date_time BETWEEN :startDate and :endDate)) " +
            "group by enc.individual_id " +
            "order by count desc " +
            "limit 1", nativeQuery = true)
    Long getMaxEncounterCount(String encounterTypeUUID, Calendar startDate, Calendar endDate);

    Encounter findByLegacyId(String legacyId);

    default Specification<Encounter> withIndividualId(Long id) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
        {
            return id == null ? null : cb.equal(root.get("individual").get("id"), id);
        };
    }

    default Specification<Encounter> withEncounterEarliestVisitDateTime(DateTime earliestVisitDateTime) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                earliestVisitDateTime == null ? null : cb.equal(root.get("earliestVisitDateTime").as(Date.class), earliestVisitDateTime.toDate());
    }

    default Specification<Encounter> withEncounterDateTime(DateTime encounterDateTime) {
        return (Root<Encounter> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                encounterDateTime == null ? null : cb.equal(root.get("encounterDateTime").as(Date.class), encounterDateTime.toDate());
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

    default Page<Encounter> findByConcepts(DateTime lastModifiedDateTime, DateTime now, Map<String, String> concepts, Pageable pageable) {
        return findAll(findByConceptsSpec(lastModifiedDateTime, now, concepts), pageable);
    }

    default Page<Encounter> findByConceptsAndEncounterType(DateTime lastModifiedDateTime, DateTime now, Map<String, String> concepts, String encounterType, Pageable pageable) {
        return findAll(
                findByConceptsSpec(lastModifiedDateTime, now, concepts)
                        .and(findByEncounterTypeSpec(encounterType)),
                pageable);
    }
}
