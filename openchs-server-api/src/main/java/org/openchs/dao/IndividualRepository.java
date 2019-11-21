package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Root;
import java.util.List;

import static org.openchs.domain.OperatingIndividualScope.ByCatchment;
import static org.openchs.domain.OperatingIndividualScope.ByFacility;

@Repository
@RepositoryRestResource(collectionResourceRel = "individual", path = "individual", exported = false)
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface IndividualRepository extends TransactionalDataRepository<Individual>, OperatingIndividualScopeAwareRepository<Individual> {
    Page<Individual> findByAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<Individual> findByAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    Page<Individual> findByFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId,
            DateTime lastModifiedDateTime,
            DateTime now,
            Pageable pageable);

    @Override
    default Page<Individual> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Individual> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByFacilityIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }

    default Specification<Individual> getFilterSpecForVoid(Boolean includeVoided) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                includeVoided == null || includeVoided ? cb.and() : cb.isFalse(root.get("isVoided"));
    }

    default Specification<Individual> getFilterSpecForName(String value) {
        return (Root<Individual> root, CriteriaQuery<?> query, CriteriaBuilder cb) ->
                value == null ? cb.and() : cb.or(
                        cb.like(cb.upper(root.get("firstName")), "%" + value.toUpperCase() + "%"),
                        cb.like(cb.upper(root.get("lastName")), "%" + value.toUpperCase() + "%"));
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

    @Override
    default Specification<Individual> getFilterSpecForOperatingSubjectScope(User user) {
        OperatingIndividualScope scope = user.getOperatingIndividualScope();
        Facility facility = user.getFacility();
        Catchment catchment = user.getCatchment();
        if (ByCatchment.equals(scope)) {
            return (root, query, cb) ->
                    root.join("addressLevel")
                            .joinSet("virtualCatchments").get("id").in(catchment.getId());
        }
        if (ByFacility.equals(scope)) {
            return (root, query, cb) -> root.join("facility").get("id").in(facility.getId());
        }
        return (r, q, cb) -> cb.and();
    }

    @Query("select ind from Individual ind " +
            "where ind.isVoided = false")
    Page<Individual> findIndividuals(Pageable pageable);
}