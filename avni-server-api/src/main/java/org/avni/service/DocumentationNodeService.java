package org.avni.service;

import org.avni.common.EntityHelper;
import org.avni.dao.DocumentationNodeRepository;
import org.avni.domain.*;
import org.avni.web.request.CHSRequest;
import org.avni.web.request.webapp.documentation.DocumentationContract;
import org.avni.web.request.webapp.documentation.DocumentationItemContract;
import org.avni.web.request.webapp.documentation.DocumentationNodeContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DocumentationNodeService {

    private final DocumentationNodeRepository documentationNodeRepository;

    @Autowired
    public DocumentationNodeService(DocumentationNodeRepository documentationNodeRepository) {
        this.documentationNodeRepository = documentationNodeRepository;
    }

    public List<DocumentationNodeContract> getAll() {
        return documentationNodeRepository.findAllByIsVoidedFalse()
                .stream()
                .map(DocumentationNodeContract::fromDocumentationNode)
                .collect(Collectors.toList());
    }

    public DocumentationNode saveDocumentation(DocumentationNodeContract documentationNodeContract) {
        DocumentationNode documentationNode = EntityHelper.newOrExistingEntity(documentationNodeRepository, documentationNodeContract, new DocumentationNode());
        assignUUIDIfNull(documentationNode, documentationNodeContract);
        documentationNode.setName(documentationNodeContract.getName());
        if (documentationNodeContract.getParent() != null) {
            documentationNode.setParent(documentationNodeRepository.findByUuid(documentationNodeContract.getParent().getUuid()));
        }
        Set<Documentation> documentations = createDocumentations(documentationNodeContract.getDocumentations(), documentationNode);
        documentationNode.setDocumentations(documentations);
        return documentationNodeRepository.save(documentationNode);
    }

    private Set<Documentation> createDocumentations(Set<DocumentationContract> documentationContracts, DocumentationNode documentationNode) {
        Set<Documentation> savedDocumentations = documentationNode.getDocumentations();
        for (DocumentationContract documentationContract : documentationContracts) {
            Documentation existingDocumentation = documentationNode.findDocumentation(documentationContract.getUuid());
            Documentation documentation = getOrDefault(existingDocumentation, new Documentation());
            assignUUIDIfNull(documentation, documentationContract);
            documentation.setName(documentationContract.getName());
            documentation.setDocumentationNode(documentationNode);
            Set<DocumentationItem> documentationItems = createDocumentationItems(documentationContract.getDocumentationItems(), documentation);
            documentation.setDocumentationItems(documentationItems);
            documentation.updateAudit();
            savedDocumentations.add(documentation);
        }
        return savedDocumentations;
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
