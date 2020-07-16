package org.openchs.dao;

import org.openchs.domain.Concept;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "concept", path = "concept")
public interface ConceptRepository extends ReferenceDataRepository<Concept>, FindByLastModifiedDateTime<Concept> {
    Page<Concept> findByIsVoidedFalseAndNameIgnoreCaseContaining(String name, Pageable pageable);
    List<Concept> findAllByDataType(String dataType);
    List<Concept> findByIsVoidedFalseAndActiveTrueAndNameIgnoreCaseContains(String name);
    List<Concept> findByIsVoidedFalseAndActiveTrueAndDataTypeAndNameIgnoreCaseContains(String dataType, String name);

    @Query("select c from Concept c where c.isVoided = false")
    Page<Concept> getAllNonVoidedConcepts(Pageable pageable);

    @Query("select c.name from Concept c where c.isVoided = false")
    List<String> getAllNames();

    List<Concept> getAllConceptByUuidIn(List<String> uuid);
}
