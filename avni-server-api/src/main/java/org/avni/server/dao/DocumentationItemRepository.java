package org.avni.server.dao;

import org.avni.server.domain.DocumentationItem;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user')")
public interface DocumentationItemRepository extends ReferenceDataRepository<DocumentationItem>, FindByLastModifiedDateTime<DocumentationItem> {

    default DocumentationItem findByName(String name) {
        throw new UnsupportedOperationException("No field 'name' in DocumentationItem.");
    }

    default DocumentationItem findByNameIgnoreCase(String name) {
        throw new UnsupportedOperationException("No field 'name' in DocumentationItem.");
    }

}
