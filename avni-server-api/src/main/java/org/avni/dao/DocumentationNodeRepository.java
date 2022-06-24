package org.avni.dao;


import org.avni.domain.DocumentationNode;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface DocumentationNodeRepository extends ReferenceDataRepository<DocumentationNode>, FindByLastModifiedDateTime<DocumentationNode> {
}
