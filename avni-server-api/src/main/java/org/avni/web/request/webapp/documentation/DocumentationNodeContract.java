package org.avni.web.request.webapp.documentation;

import org.avni.domain.DocumentationNode;
import org.avni.web.request.ReferenceDataContract;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class DocumentationNodeContract extends ReferenceDataContract {

    private Set<DocumentationContract> documentations = new HashSet<>();
    private DocumentationNodeContract parent;

    public static DocumentationNodeContract fromDocumentationNode(DocumentationNode documentationNode) {
        DocumentationNodeContract documentationNodeContract = new DocumentationNodeContract();
        documentationNodeContract.setUuid(documentationNode.getUuid());
        documentationNodeContract.setName(documentationNode.getName());
        if (documentationNode.getParent() != null) {
            documentationNodeContract.setParent(DocumentationNodeContract.fromDocumentationNode(documentationNode.getParent()));
        }
        Set<DocumentationContract> documentationContracts = documentationNode.getDocumentations().stream()
                .map(DocumentationContract::fromDocumentation)
                .collect(Collectors.toSet());
        documentationNodeContract.setDocumentations(documentationContracts);
        documentationNodeContract.setVoided(documentationNode.isVoided());
        return documentationNodeContract;
    }

    public Set<DocumentationContract> getDocumentations() {
        return documentations;
    }

    public void setDocumentations(Set<DocumentationContract> documentations) {
        this.documentations = documentations;
    }

    public DocumentationNodeContract getParent() {
        return parent;
    }

    public void setParent(DocumentationNodeContract parent) {
        this.parent = parent;
    }
}
