package org.openchs.dao;

import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.domain.RuleDependency;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "ruleDependency", path = "ruleDependency")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface RuleDependencyRepository extends PagingAndSortingRepository<RuleDependency, Long>, CHSRepository<RuleDependency> {
    RuleDependency findByOrganisationId(Long organisationId);
}
