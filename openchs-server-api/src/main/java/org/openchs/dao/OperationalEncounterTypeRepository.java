package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "operationalEncounterType", path = "operationalEncounterType")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface OperationalEncounterTypeRepository extends PagingAndSortingRepository<OperationalEncounterType, Long>, CHSRepository<OperationalEncounterType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<OperationalEncounterType> findByAuditLastModifiedDateTimeGreaterThanOrderByAuditLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);

    OperationalEncounterType findByEncounterTypeAndOrganisationId(EncounterType encounterType, long organisationId);
}