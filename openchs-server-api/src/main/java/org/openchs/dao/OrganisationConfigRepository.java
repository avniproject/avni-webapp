package org.openchs.dao;

import org.openchs.domain.OrganisationConfig;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "organisationConfig", path = "organisationConfig")
@PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
public interface OrganisationConfigRepository extends PagingAndSortingRepository<OrganisationConfig, Long> {
    OrganisationConfig findByUuid(String uuid);
}
