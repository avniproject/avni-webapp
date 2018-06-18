package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.EncounterType;
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
@RepositoryRestResource(collectionResourceRel = "encounterType", path = "encounterType")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface EncounterTypeRepository extends PagingAndSortingRepository<EncounterType, Long>, ReferenceDataRepository<EncounterType> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<EncounterType> findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    List<EncounterType> findAllByName(String name);

    EncounterType findByNameAndVoidedFalse(String name);
}