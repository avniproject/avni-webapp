package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.application.projections.WebSearchResultProjection;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Concept;
import org.openchs.domain.Individual;
import org.openchs.domain.SubjectType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.*;
import java.util.List;
import java.util.Map;

@Repository
@RepositoryRestResource(collectionResourceRel = "individual", path = "individual", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface IndividualRepository extends TransactionalDataRepository<Individual>, OperatingIndividualScopeAwareRepository<Individual> {
    Page<Individual> findByAddressLevelVirtualCatchmentsIdAndSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<Individual> findByFacilityIdAndSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            Long subjectTypeId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    @Override
    default Page<Individual> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByAddressLevelVirtualCatchmentsIdAndSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, filter, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Individual> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByFacilityIdAndSubjectTypeIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, filter, lastModifiedDateTime, now, pageable);
    }

    default Specification<Individual> getFilterSpecForVoid(Boolean includeVoided) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                includeVoided == null || includeVoided ? cb.and() : cb.isFalse(root.get("isVoided"));
    }

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
            "and ind.subjectType.uuid = :subjectTypeUUID " +
            "and (coalesce(:locationIds,NULL) is null OR ind.addressLevel.id in :locationIds)")
    Page<Individual> findIndividuals(String subjectTypeUUID, List<Long> locationIds, Pageable pageable);

    Individual findByLegacyId(String legacyId);

    Individual findByLegacyIdAndSubjectType(String legacyId, SubjectType subjectType);

    @Query(value = "select firstname,lastname,fullname,id,uuid,title_lineage,subject_type_name,gender_name,date_of_birth,enrolments,total_elements from web_search_function(:jsonSearch, :dbUser)", nativeQuery = true)
    List<WebSearchResultProjection> getWebSearchResults(String jsonSearch, String dbUser);

    default Specification<Individual> findBySubjectTypeSpec(String subjectType) {
        Specification<Individual> spec = (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            Join<Individual, SubjectType> subjectTypeJoin = root.join("subjectType", JoinType.LEFT);
            return cb.and(cb.equal(subjectTypeJoin.get("name"), subjectType));
        };
        return spec;
    }

    default Page<Individual> findByConcepts(DateTime lastModifiedDateTime, DateTime now, Map<Concept, String> concepts, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts)), pageable);
    }

    default Page<Individual> findByConceptsAndSubjectType(DateTime lastModifiedDateTime, DateTime now, Map<Concept, String> concepts, String subjectType, Pageable pageable) {
        return findAll(lastModifiedBetween(lastModifiedDateTime, now)
                .and(withConceptValues(concepts))
                .and(findBySubjectTypeSpec(subjectType)), pageable);
    }

    List<Individual> findAllByAddressLevelAndSubjectTypeAndIsVoidedFalse(AddressLevel addressLevel, SubjectType subjectType);
}
