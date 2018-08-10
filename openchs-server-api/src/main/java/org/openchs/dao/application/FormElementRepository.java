package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.FormElement;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.Concept;
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
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormElementRepository extends PagingAndSortingRepository<FormElement, Long>, ReferenceDataRepository<FormElement> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<FormElement> findByAuditLastModifiedDateTimeIsBetweenOrderByAuditLastModifiedDateTimeAscIdAsc(
            @Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime,
            @Param("now") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime now,
            Pageable pageable);

    FormElement findFirstByConcept(Concept concept);
}