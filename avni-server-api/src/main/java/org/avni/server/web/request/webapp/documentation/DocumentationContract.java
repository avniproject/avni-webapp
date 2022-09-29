package org.avni.server.web.request.webapp.documentation;

import org.avni.server.domain.Documentation;
import org.avni.server.web.request.ReferenceDataContract;
import org.joda.time.DateTime;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class DocumentationContract extends ReferenceDataContract {

    private Set<DocumentationItemContract> documentationItems = new HashSet<>();
    private String createdBy;
    private DateTime createdDateTime;
    private String lastModifiedBy;
    private DateTime lastModifiedDateTime;
    private DocumentationContract parent;

    public static DocumentationContract fromDocumentation(Documentation documentation) {
        DocumentationContract documentationContract = DocumentationContract.fromDocumentationWithoutAudit(documentation);
        documentationContract.setCreatedBy(documentation.getCreatedByName());
        documentationContract.setCreatedDateTime(documentation.getCreatedDateTime());
        documentationContract.setLastModifiedBy(documentation.getLastModifiedByName());
        documentationContract.setLastModifiedDateTime(documentation.getLastModifiedDateTime());
        return documentationContract;
    }

    public static DocumentationContract fromDocumentationWithoutAudit(Documentation documentation) {
        DocumentationContract documentationContract = new DocumentationContract();
        documentationContract.setUuid(documentation.getUuid());
        documentationContract.setName(documentation.getName());
        Set<DocumentationItemContract> documentationItemRequests = documentation.getDocumentationItems()
                .stream()
                .map(DocumentationItemContract::fromDocumentationItem)
                .collect(Collectors.toSet());
        documentationContract.setDocumentationItems(documentationItemRequests);
        documentationContract.setVoided(documentation.isVoided());
        if (documentation.getParent() != null) {
            documentationContract.setParent(DocumentationContract.fromDocumentationWithoutAudit(documentation.getParent()));
        }
        return documentationContract;
    }

    public Set<DocumentationItemContract> getDocumentationItems() {
        return documentationItems;
    }

    public void setDocumentationItems(Set<DocumentationItemContract> documentationItems) {
        this.documentationItems = documentationItems;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public DocumentationContract getParent() {
        return parent;
    }

    public void setParent(DocumentationContract parent) {
        this.parent = parent;
    }
}
