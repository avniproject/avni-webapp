package org.avni.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "documentation")
@BatchSize(size = 100)
public class Documentation extends OrganisationAwareEntity {

    @NotNull
    @Column
    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "documentation_node_id")
    private DocumentationNode documentationNode;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "documentation")
    private Set<DocumentationItem> documentationItems = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DocumentationNode getDocumentationNode() {
        return documentationNode;
    }

    public void setDocumentationNode(DocumentationNode documentationNode) {
        this.documentationNode = documentationNode;
    }

    public Set<DocumentationItem> getDocumentationItems() {
        return documentationItems;
    }

    public void setDocumentationItems(Set<DocumentationItem> documentationItems) {
        this.documentationItems = documentationItems;
    }

    public DocumentationItem findDocumentationItem(String uuid) {
        return this.documentationItems.stream().filter(i -> i.getUuid().equals(uuid)).findAny().orElse(null);
    }
}
