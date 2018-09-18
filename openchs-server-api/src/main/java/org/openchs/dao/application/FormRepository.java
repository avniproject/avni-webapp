package org.openchs.dao.application;

import org.openchs.application.Form;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "form", path = "form")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface FormRepository extends PagingAndSortingRepository<Form, Long>, ReferenceDataRepository<Form>, FindByLastModifiedDateTime<Form> {
}