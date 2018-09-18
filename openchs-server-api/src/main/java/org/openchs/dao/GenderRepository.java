package org.openchs.dao;

import org.openchs.domain.Gender;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "gender", path = "gender")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface GenderRepository extends PagingAndSortingRepository<Gender, Long>, ReferenceDataRepository<Gender>, FindByLastModifiedDateTime<Gender> {
}