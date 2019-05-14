package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.ParentLocationMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "locationMapping", path = "locationMapping", exported = false)
public interface LocationMappingRepository extends ReferenceDataRepository<ParentLocationMapping>, FindByLastModifiedDateTime<ParentLocationMapping>, OperatingIndividualScopeAwareRepository<ParentLocationMapping> {
    @RestResource(path = "byCatchmentAndLastModified", rel = "byCatchmentAndLastModified")
    Page<ParentLocationMapping> findByParentLocationVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("catchmentId") long catchmentId,
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    @Override
    default Page<ParentLocationMapping> findByCatchmentIndividualOperatingScope(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByParentLocationVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ParentLocationMapping> findByFacilityIndividualOperatingScope(long facilityId, DateTime lastModifiedDateTime, DateTime now, Pageable pageable) {
        return findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }
}
