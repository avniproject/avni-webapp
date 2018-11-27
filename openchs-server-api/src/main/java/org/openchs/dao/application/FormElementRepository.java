package org.openchs.dao.application;

import org.openchs.application.FormElement;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElement", path = "formElement")
public interface FormElementRepository extends ReferenceDataRepository<FormElement>, FindByLastModifiedDateTime<FormElement> {
    FormElement findFirstByConcept(Concept concept);
}