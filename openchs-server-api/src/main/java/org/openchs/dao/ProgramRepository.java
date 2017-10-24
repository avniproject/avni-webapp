package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Program;
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
@RepositoryRestResource(collectionResourceRel = "program", path = "program")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ProgramRepository extends PagingAndSortingRepository<Program, Long>, ReferenceDataRepository<Program> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Program> findByLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}