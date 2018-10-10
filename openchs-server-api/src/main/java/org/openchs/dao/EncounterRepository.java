package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Encounter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "encounter", path = "encounter", exported = false)
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface EncounterRepository extends PagingAndSortingRepository<Encounter, Long>, CHSRepository<Encounter>, OperatingIndividualScopeAwareRepository<Encounter> {
    Page<Encounter> findByAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAudit_LastModifiedDateTimeAscIdAsc(
            DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(
            long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    Page<Encounter> findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(
            long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable);

    @Override
    default Page<Encounter> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualAddressLevelVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<Encounter> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByIndividualFacilityIdAndAuditLastModifiedDateTimeIsBetweenAndIsVoidedFalseOrderByAuditLastModifiedDateTimeAscIdAsc(facilityId, lastModifiedDateTime, now, pageable);
    }
}
