package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "documentation_item")
@BatchSize(size = 100)
public class DocumentationItem extends OrganisationAwareEntity {

    @NotNull
    @Column
    private String content;

    @NotNull
    @Column(name = "contenthtml")
    private String contentHtml;

    @NotNull
    @Column
    @Enumerated(EnumType.STRING)
    private Locale language;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documentation_id")
    private Documentation documentation;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContentHtml() {
        return contentHtml;
    }

    public void setContentHtml(String contentHtml) {
        this.contentHtml = contentHtml;
    }

    public Locale getLanguage() {
        return language;
    }

    public void setLanguage(Locale language) {
        this.language = language;
    }

    public Documentation getDocumentation() {
        return documentation;
    }

    public void setDocumentation(Documentation documentation) {
        this.documentation = documentation;
    }
}
