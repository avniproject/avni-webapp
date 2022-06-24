package org.avni.service;

import org.avni.dao.DocumentationRepository;
import org.avni.domain.Documentation;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DocumentationService implements NonScopeAwareService {

    private final DocumentationRepository documentationRepository;

    @Autowired
    public DocumentationService(DocumentationRepository documentationRepository) {
        this.documentationRepository = documentationRepository;
    }

    public Documentation get(String UUID) {
        return documentationRepository.findByUuid(UUID);
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return documentationRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
