package org.avni.server.dao;

import org.avni.server.application.projections.DocumentationProjection;
import org.avni.server.domain.Documentation;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface DocumentationRepository extends ReferenceDataRepository<Documentation>, FindByLastModifiedDateTime<Documentation> {

    Page<DocumentationProjection> findByIsVoidedFalseAndNameIgnoreCaseContains(String name, Pageable pageable);

}
