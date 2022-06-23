package org.avni.dao;

import org.avni.application.projections.DocumentationProjection;
import org.avni.domain.Documentation;
import org.springframework.data.domain.Page;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

@Repository
@RepositoryRestResource(collectionResourceRel = "documentation", path = "documentation")
@PreAuthorize("hasAnyAuthority('user')")
public interface DocumentationRepository extends ReferenceDataRepository<Documentation>, FindByLastModifiedDateTime<Documentation> {

    Page<DocumentationProjection> findByIsVoidedFalseAndNameIgnoreCaseContains(String name, Pageable pageable);

}
