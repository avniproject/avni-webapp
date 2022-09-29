package org.avni.server.dao;

import org.avni.server.domain.Rule;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "rule", path = "rule")
public interface RuleRepository extends ReferenceDataRepository<Rule>, FindByLastModifiedDateTime<Rule> {
    List<Rule> findByOrganisationId(Long id);
}
