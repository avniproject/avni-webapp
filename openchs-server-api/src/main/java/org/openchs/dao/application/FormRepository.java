package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.Form;
import org.openchs.dao.ReferenceDataRepository;
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
@RepositoryRestResource(collectionResourceRel = "form", path = "form")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormRepository extends PagingAndSortingRepository<Form, Long>, ReferenceDataRepository<Form> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<Form> findByLastModifiedDateTimeGreaterThanOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);
}