package org.avni.dao;

import org.avni.domain.DocumentationItem;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "documentationItem", path = "documentationItem")
@PreAuthorize("hasAnyAuthority('user')")
public interface DocumentationItemRepository extends ReferenceDataRepository<DocumentationItem>, FindByLastModifiedDateTime<DocumentationItem> {

    default DocumentationItem findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in DocumentationItem.");
    }

    default DocumentationItem findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in DocumentationItem.");
    }

}
