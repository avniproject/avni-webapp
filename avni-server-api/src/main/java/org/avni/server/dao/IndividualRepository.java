package org.avni.server.dao;

import java.util.*;
import java.util.stream.Stream;

import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.Concept;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.projection.IndividualWebProjection;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.avni.server.application.projections.WebSearchResultProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import javax.persistence.criteria.*;

@Repository
@RepositoryRestResource(collectionResourceRel = "individual", path = "individual", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin')")
public interface IndividualRepository extends TransactionalDataRepository<Individual>, OperatingIndividualScopeAwareRepository<Individual> {

    default Specification<Individual> syncTypeIdSpecification(Long typeId) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                cb.equal(root.get("subjectType").get("id"), typeId);
    }

    @Override
    default Page<Individual> getSyncResults(SyncParameters syncParameters) {
        return findAll(syncAuditSpecification(syncParameters)
                        .and(syncTypeIdSpecification(syncParameters.getTypeId()))
                        .and(syncStrategySpecification(syncParameters)),
                syncParameters.getPageable());
    }

    @Override
    default boolean isEntityChangedForCatchment(SyncParameters syncParameters) {
        return count(syncEntityChangedAuditSpecification(syncParameters)
                .and(syncTypeIdSpecification(syncParameters.getTypeId()))
                .and(syncStrategySpecification(syncParameters))
        ) > 0;
    }

    default Specification<Individual> getFilterSpecForVoid(Boolean includeVoided) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                includeVoided == null || includeVoided ? cb.and() : cb.isFalse(root.get("isVoided"));
    }

    default Page<Individual> findByName(String name, Pageable pageable) {
        return findAll(getFilterSpecForName(name), pageable);
    }

    Page<Individual> findByIdIn(Long[] ids, Pageable pageable);

    default Specification<Individual> getFilterSpecForName(String value) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            if (value != null && !value.isEmpty()) {
                Predicate[] predicates = new Predicate[2];
                String[] values = value.trim().split(" ");
                if (values.length > 0) {
                    predicates[0] = cb.like(cb.upper(root.get("firstName")), values[0].toUpperCase() + "%");
                    predicates[1] = cb.like(cb.upper(root.get("lastName")), values[0].toUpperCase() + "%");
                }
                if (values.length > 1) {
                    predicates[1] = cb.like(cb.upper(root.get("lastName")), values[1].toUpperCase() + "%");
                    return cb.and(predicates[0], predicates[1]);
                }
                return cb.or(predicates[0], predicates[1]);
            }
            return cb.and();
        };
    }

    default Specification<Individual> getFilterSpecForSubjectTypeId(String subjectTypeUUID) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                subjectTypeUUID == null ? cb.and() : root.get("subjectType").get("uuid").in(subjectTypeUUID);
    }

    default Specification<Individual> getFilterSpecForObs(String value) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                value == null ? cb.and() : cb.or(
                        jsonContains(root.get("observations"), "%" + value + "%", cb),
                        jsonContains(root.join("programEnrolments", JoinType.LEFT).get("observations"), "%" + value + "%", cb));
    }

    default Specification<Individual> getFilterSpecForLocationIds(List<Long> locationIds) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                locationIds == null ? cb.and() : root.get("addressLevel").get("id").in(locationIds);
    }

    default Specification<Individual> getFilterSpecForAddress(String locationName) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                locationName == null ? cb.and() :
                        cb.like(cb.upper(root.get("addressLevel").get("titleLineage")), "%" + locationName.toUpperCase() + "%");
    }

    @Query("select ind from Individual ind " +
            "where ind.isVoided = false " +
            "and ind.subjectType.id = :subjectTypeId " +
            "and ind.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds,NULL) is null OR ind.addressLevel.id in :locationIds)")
    Stream<Individual> findNonVoidedIndividuals(Long subjectTypeId, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime);

    @Query("select ind from Individual ind " +
            "where ind.subjectType.id = :subjectTypeId " +
            "and ind.registrationDate between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds,NULL) is null OR ind.addressLevel.id in :locationIds)")
    Stream<Individual> findAllIndividuals(Long subjectTypeId, List<Long> locationIds, LocalDate startDateTime, LocalDate endDateTime);

    //group by is added for distinct ind records
    @Query("select i from Individual i " +
            "join i.encounters enc " +
            "where enc.encounterType.id = :encounterTypeId " +
            "and enc.isVoided = false " +
            "and i.isVoided = false " +
            "and coalesce(enc.encounterDateTime, enc.cancelDateTime) between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR i.addressLevel.id in :locationIds)" +
            "group by i.id")
    Stream<Individual> findNonVoidedEncounters(List<Long> locationIds, DateTime startDateTime, DateTime endDateTime, Long encounterTypeId);

    @Query("select i from Individual i " +
            "join i.encounters enc " +
            "where enc.encounterType.id = :encounterTypeId " +
            "and coalesce(enc.encounterDateTime, enc.cancelDateTime) between :startDateTime and :endDateTime " +
            "and (coalesce(:locationIds, null) is null OR i.addressLevel.id in :locationIds)" +
            "group by i.id")
    Stream<Individual> findAllEncounters(List<Long> locationIds, DateTime startDateTime, DateTime endDateTime, Long encounterTypeId);


    @Query("select i from Individual i where i.uuid =:id or i.legacyId = :id")
    Individual findByLegacyIdOrUuid(String id);

    @Query("select i from Individual i where i.legacyId = :id")
    Individual findByLegacyId(String id);

    @Query("select i from Individual i where (i.uuid =:id or i.legacyId = :id) and i.subjectType = :subjectType")
    Individual findByLegacyIdOrUuidAndSubjectType(String id, SubjectType subjectType);

    @Query(value = "select firstname,lastname,fullname,id,uuid,title_lineage,subject_type_name,gender_name,date_of_birth,enrolments,total_elements from web_search_function(:jsonSearch, :dbUser)", nativeQuery = true)
    List<WebSearchResultProjection> getWebSearchResults(String jsonSearch, String dbUser);

    default Specification<Individual> findBySubjectTypeSpec(String subjectType) {
        Specification<Individual> spec = (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Individual, SubjectType> subjectTypeJoin = root.join("subjectType", JoinType.LEFT);
            return cb.and(cb.equal(subjectTypeJoin.get("name"), subjectType));
        };
        return spec;
    }

    default Specification<Individual> findInLocationSpec(List<Long> addressIds) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                addressIds.isEmpty() ? null : root.get("addressLevel").get("id").in(addressIds);
    }

    default Page<Individual> findByConcepts(Date lastModifiedDateTime, Date now, Map<Concept, String> concepts, List<Long> addressIds, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts, "observations"))
                .and(findInLocationSpec(addressIds)), pageable);
    }

    default Page<Individual> findByConceptsAndSubjectType(Date lastModifiedDateTime, Date now, Map<Concept, String> concepts, String subjectType, List<Long> addressIds, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts, "observations"))
                .and(findBySubjectTypeSpec(subjectType))
                .and(findInLocationSpec(addressIds)), pageable);
    }

    List<Individual> findAllByAddressLevelAndSubjectTypeAndIsVoidedFalse(AddressLevel addressLevel, SubjectType subjectType);

    List<IndividualWebProjection> findAllByUuidIn(List<String> uuids);

    @Modifying(clearAutomatically = true)
    @Query(value = "update individual i set " +
            "sync_concept_1_value = CAST((i.observations ->> CAST(:syncAttribute1 as text)) as text), " +
            "sync_concept_2_value = CAST((i.observations ->> CAST(:syncAttribute2 as text)) as text) " +
            "where i.subject_type_id = :subjectTypeId", nativeQuery = true)
    void updateConceptSyncAttributesForSubjectType(Long subjectTypeId, String syncAttribute1, String syncAttribute2);

    boolean existsByAddressLevelIdIn(List<Long> addressIds);
    default boolean hasSubjectsInLocations(List<Long> addressIds) {
        return addressIds.isEmpty() ? false : existsByAddressLevelIdIn(addressIds);
    }
    boolean existsBySubjectTypeUuid(String subjectTypeUUID);

    default Individual getSubject(String uuid, String legacyId) {
        Individual individual = null;
        if (StringUtils.hasLength(uuid)) {
            individual = this.findByUuid(uuid);
        }
        if (individual == null && StringUtils.hasLength(legacyId)) {
            individual = this.findByLegacyId(legacyId.trim());
        }
        return individual;
    }
}
