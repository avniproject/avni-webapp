package org.avni.dao;

import org.joda.time.DateTime;
import org.avni.domain.AddressLevel;
import org.avni.domain.ParentLocationMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import java.util.List;

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
    default Page<ParentLocationMapping> findByCatchmentIndividualOperatingScopeAndFilterByType(long catchmentId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByParentLocationVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(catchmentId, lastModifiedDateTime, now, pageable);
    }

    @Override
    default Page<ParentLocationMapping> findByFacilityIndividualOperatingScopeAndFilterByType(long facilityId, DateTime lastModifiedDateTime, DateTime now, Long filter, Pageable pageable) {
        return findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(lastModifiedDateTime, now, pageable);
    }

    default ParentLocationMapping findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    default ParentLocationMapping findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in ParentLocationMapping");
    }

    List<ParentLocationMapping> findAllByLocation(AddressLevel location);
}
