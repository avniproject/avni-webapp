package org.openchs.dao;

import org.openchs.domain.Concept;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
@PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
public interface ConceptRepository extends PagingAndSortingRepository<Concept, Long>, ReferenceDataRepository<Concept>, FindByLastModifiedDateTime<Concept> {
}