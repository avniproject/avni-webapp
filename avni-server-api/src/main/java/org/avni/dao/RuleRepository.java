package org.avni.dao;

import org.avni.domain.Rule;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "rule", path = "rule")
public interface RuleRepository extends ReferenceDataRepository<Rule>, FindByLastModifiedDateTime<Rule> {
    List<Rule> findByOrganisationId(Long id);
}
