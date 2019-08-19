package org.openchs.dao;

import org.openchs.domain.Concept;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
public interface ConceptRepository extends ReferenceDataRepository<Concept>, FindByLastModifiedDateTime<Concept> {

    Page<Concept> findByNameIgnoreCaseContaining(String name, Pageable pageable);

    Concept findByName(@Param("name") String name);
}