package org.openchs.dao;

import org.openchs.domain.Rule;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "rule", path = "rule")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface RuleRepository extends PagingAndSortingRepository<Rule, Long>, ReferenceDataRepository<Rule> {
}
