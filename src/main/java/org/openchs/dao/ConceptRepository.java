package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Concept;
import org.openchs.domain.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Transactional
@Repository
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
public interface ConceptRepository extends PagingAndSortingRepository<Concept, Long>, ReferenceDataRepository<Concept> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Concept> findByLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}