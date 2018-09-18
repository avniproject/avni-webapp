package org.openchs.dao.application;

import org.openchs.application.FormElementGroup;
import org.openchs.dao.FindByLastModifiedDateTime;
import org.openchs.dao.ReferenceDataRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "formElementGroup", path = "formElementGroup")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin', 'organisation_admin')")
public interface FormElementGroupRepository extends PagingAndSortingRepository<FormElementGroup, Long>, ReferenceDataRepository<FormElementGroup>, FindByLastModifiedDateTime<FormElementGroup> {
}