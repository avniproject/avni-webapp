package org.openchs.dao.application;

import org.openchs.application.FormElement;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormElementRepository extends PagingAndSortingRepository<FormElement, Long>, ReferenceDataRepository<FormElement> {
    @RestResource(path = "lastModified", rel = "lastModified")
    FormElement findFirstByConcept(Concept concept);
}