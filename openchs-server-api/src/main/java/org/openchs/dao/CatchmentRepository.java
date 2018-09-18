package org.openchs.dao;

import org.openchs.domain.Catchment;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "catchment", path = "catchment")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface CatchmentRepository extends PagingAndSortingRepository<Catchment, Long>, ReferenceDataRepository<Catchment>, FindByLastModifiedDateTime<Catchment> {
}