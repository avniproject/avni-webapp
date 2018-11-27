package org.openchs.dao;

import org.openchs.domain.Gender;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "gender", path = "gender")
public interface GenderRepository extends ReferenceDataRepository<Gender>, FindByLastModifiedDateTime<Gender> {
}