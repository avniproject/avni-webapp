package org.avni.server.domain;

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

    @ManyToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "parent_id")
    private Documentation parent;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "documentation")
    private Set<DocumentationItem> documentationItems = new HashSet<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<DocumentationItem> getDocumentationItems() {
        return documentationItems;
    }

    public void setDocumentationItems(Set<DocumentationItem> documentationItems) {
        this.documentationItems = documentationItems;
    }

    public Documentation getParent() {
        return parent;
    }

    public void setParent(Documentation parent) {
        this.parent = parent;
    }

    public DocumentationItem findDocumentationItem(String uuid) {
        return this.documentationItems.stream().filter(i -> i.getUuid().equals(uuid)).findAny().orElse(null);
    }
}
