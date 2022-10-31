package org.avni.server.web.request.webapp.documentation;

import org.avni.server.domain.DocumentationItem;
import org.avni.server.web.request.ReferenceDataContract;

public class DocumentationItemContract extends ReferenceDataContract {
    private String content;
    private String contentHtml;
    private String language;
    private String documentationUUID;

    public static DocumentationItemContract fromDocumentationItem(DocumentationItem documentationItem) {
        DocumentationItemContract documentationItemContract = new DocumentationItemContract();
        documentationItemContract.setUuid(documentationItem.getUuid());
        documentationItemContract.setContent(documentationItem.getContent());
        documentationItemContract.setContentHtml(documentationItem.getContentHtml());
        documentationItemContract.setLanguage(documentationItem.getLanguage().toString());
        documentationItemContract.setDocumentationUUID(documentationItem.getDocumentation().getUuid());
        documentationItemContract.setVoided(documentationItem.isVoided());
        return documentationItemContract;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getDocumentationUUID() {
        return documentationUUID;
    }

    public void setDocumentationUUID(String documentationUUID) {
        this.documentationUUID = documentationUUID;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
