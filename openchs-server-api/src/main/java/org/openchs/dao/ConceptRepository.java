package org.openchs.dao;

import org.openchs.domain.Concept;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
public interface ConceptRepository extends ReferenceDataRepository<Concept>, FindByLastModifiedDateTime<Concept> {
    Page<Concept> findByNameIgnoreCaseContaining(String name, Pageable pageable);
    List<Concept> findAllByOrganisationIdAndDataTypeNotIn(Long organisationId, String[] notIn);
    List<Concept> findAllByOrganisationIdAndDataType(Long organisationId, String dataType);

    @Query("select c.name from Concept c where c.isVoided = false")
    List<String> getAllNames();
}