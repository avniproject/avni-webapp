package org.openchs.dao.application;

import org.joda.time.DateTime;
import org.openchs.application.FormElement;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.Organisation;
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
import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormElementRepository extends PagingAndSortingRepository<FormElement, Long>, ReferenceDataRepository<FormElement> {
    @RestResource(path = "lastModified", rel = "lastModified")
    Page<FormElement> findByLastModifiedDateTimeGreaterThanAndNonApplicableOrganisationsIsNullOrderByLastModifiedDateTimeAscIdAsc(@Param("lastModifiedDateTime") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime lastModifiedDateTime, Pageable pageable);

    FormElement findFirstByConcept(Concept concept);
}