package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Concept;
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
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ConceptRepository extends PagingAndSortingRepository<Concept, Long>, ReferenceDataRepository<Concept> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Concept> findByAuditLastModifiedDateTimeGreaterThanOrderByAuditLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}