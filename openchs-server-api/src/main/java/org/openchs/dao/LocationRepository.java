package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.AddressLevel;
import org.openchs.domain.Catchment;
import org.openchs.web.request.ReferenceDataContract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "locations", path = "locations")
public interface LocationRepository extends ReferenceDataRepository<AddressLevel> {
    @RestResource(path = "byCatchmentAndLastModified", rel = "byCatchmentAndLastModified")
    Page<AddressLevel> findByVirtualCatchmentsIdAndAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("catchmentId") long catchmentId,
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    AddressLevel findByTitleAndCatchmentsUuid(String title, String uuid);

    AddressLevel findByTitleIgnoreCase(String title);

    List<AddressLevel> findByCatchments(Catchment catchment);

    AddressLevel findByTitle(String title);

    default AddressLevel findByName(String name) {
        return findByTitle(name);
    }

    default AddressLevel findByNameIgnoreCase(String name) {
        return findByTitleIgnoreCase(name);
    }
}
