package org.avni.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "documentation_node")
@BatchSize(size = 100)
public class DocumentationNode extends OrganisationAwareEntity {

    @NotNull
    @Column
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "documentationNode")
    private Set<Documentation> documentations = new HashSet<>();

    @ManyToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "parent_id")
    private DocumentationNode parent;

    public Set<Documentation> getDocumentations() {
        return documentations;
    }

    public void setDocumentations(Set<Documentation> documentations) {
        this.documentations = documentations;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DocumentationNode getParent() {
        return parent;
    }

    public void setParent(DocumentationNode parent) {
        this.parent = parent;
    }

    public Documentation findDocumentation(String uuid) {
        return this.documentations.stream().filter(d -> d.getUuid().equals(uuid)).findAny().orElse(null);
    }
}
