package org.avni.service;

import org.avni.dao.DocumentationItemRepository;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DocumentationItemService implements NonScopeAwareService {

    private final DocumentationItemRepository documentationItemRepository;

    @Autowired
    public DocumentationItemService(DocumentationItemRepository documentationItemRepository) {
        this.documentationItemRepository = documentationItemRepository;
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return documentationItemRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
