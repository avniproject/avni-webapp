package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
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
public interface OperationalEncounterTypeRepository extends PagingAndSortingRepository<OperationalEncounterType, Long>, ReferenceDataRepository<OperationalEncounterType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    @Query("select oet from OperationalEncounterType oet where oet.audit.lastModifiedDateTime between :lastModifiedDateTime and :now or oet.encounterType.audit.lastModifiedDateTime between :lastModifiedDateTime and :now order by CASE WHEN oet.encounterType.audit.lastModifiedDateTime > oet.audit.lastModifiedDateTime THEN oet.encounterType.audit.lastModifiedDateTime ELSE oet.audit.lastModifiedDateTime END")
    Page<OperationalEncounterType> findByAuditLastModifiedDateTimeIsBetweenOrEncounterTypeAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    OperationalEncounterType findByEncounterTypeAndOrganisationId(EncounterType encounterType, long organisationId);

    OperationalEncounterType findByEncounterTypeIdAndOrganisationId(long encounterTypeId, long organisationId);
}