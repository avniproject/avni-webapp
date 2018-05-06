package org.openchs.dao;

import org.joda.time.DateTime;
import org.openchs.domain.Gender;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;

@Repository
@RepositoryRestResource(collectionResourceRel = "gender", path = "gender")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface GenderRepository extends PagingAndSortingRepository<Gender, Long>, ReferenceDataRepository<Gender> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Gender> findByAuditLastModifiedDateTimeGreaterThanOrderByAuditLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}