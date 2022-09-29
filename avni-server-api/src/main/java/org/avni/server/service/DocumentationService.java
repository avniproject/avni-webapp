package org.avni.server.service;

import org.avni.server.common.EntityHelper;
import org.avni.server.dao.DocumentationRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.domain.Documentation;
import org.avni.server.domain.DocumentationItem;
import org.avni.server.domain.Locale;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.webapp.documentation.DocumentationContract;
import org.avni.server.web.request.webapp.documentation.DocumentationItemContract;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

    public List<DocumentationContract> getAllNonVoided() {
        return documentationRepository.findAllByIsVoidedFalse()
                .stream()
                .map(DocumentationContract::fromDocumentation)
                .collect(Collectors.toList());
    }

    public List<DocumentationContract> getAll() {
        return documentationRepository.findAll()
                .stream()
                .map(DocumentationContract::fromDocumentationWithoutAudit)
                .collect(Collectors.toList());
    }

    public Documentation saveDocumentation(DocumentationContract documentationContract) {
        Documentation documentation = EntityHelper.newOrExistingEntity(documentationRepository, documentationContract, new Documentation());
        assignUUIDIfNull(documentation, documentationContract);
        documentation.setName(documentationContract.getName());
        Set<DocumentationItem> documentationItems = createDocumentationItems(documentationContract.getDocumentationItems(), documentation);
        documentation.setDocumentationItems(documentationItems);
        if (documentationContract.getParent() != null) {
            documentation.setParent(documentationRepository.findByUuid(documentationContract.getParent().getUuid()));
        }
        documentation.setDocumentationItems(documentationItems);
        return documentationRepository.save(documentation);
    }

    private Set<DocumentationItem> createDocumentationItems(Set<DocumentationItemContract> documentationItemContracts, Documentation documentation) {
        Set<DocumentationItem> savedDocumentationItems = documentation.getDocumentationItems();
        for (DocumentationItemContract documentationItemContract : documentationItemContracts) {
            DocumentationItem existingItem = documentation.findDocumentationItem(documentationItemContract.getUuid());
            DocumentationItem documentationItem = getOrDefault(existingItem, new DocumentationItem());
            assignUUIDIfNull(documentationItem, documentationItemContract);
            documentationItem.setDocumentation(documentation);
            documentationItem.setContent(documentationItemContract.getContent());
            documentationItem.setContentHtml(documentationItemContract.getContentHtml());
            documentationItem.setLanguage(Locale.valueOf(documentationItemContract.getLanguage()));
            savedDocumentationItems.add(documentationItem);
        }
        return savedDocumentationItems;
    }

    private <T> T getOrDefault(T existingEntity, T newEntity) {
        return existingEntity == null ? newEntity : existingEntity;
    }

    private void assignUUIDIfNull(CHSEntity chsEntity, CHSRequest request) {
        if (chsEntity.getUuid() == null) {
            chsEntity.setUuid(request.getUuid());
        }
    }
}
