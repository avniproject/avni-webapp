package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;

import javax.persistence.*;

@Entity
@Table(name = "identifier_user_assignment")
@BatchSize(size = 100)
public class IdentifierUserAssignment extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identifier_source_id")
    private IdentifierSource identifierSource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column
    private String identifierStart;

    @Column
    private String identifierEnd;

    @Column
    private String lastAssignedIdentifier;

    public IdentifierSource getIdentifierSource() {
        return identifierSource;
    }

    public void setIdentifierSource(IdentifierSource identifierSource) {
        this.identifierSource = identifierSource;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getIdentifierStart() {
        return identifierStart;
    }

    public void setIdentifierStart(String identifierStart) {
        this.identifierStart = identifierStart;
    }

    public String getIdentifierEnd() {
        return identifierEnd;
    }

    public void setIdentifierEnd(String identifierEnd) {
        this.identifierEnd = identifierEnd;
    }

    public String getLastAssignedIdentifier() {
        return lastAssignedIdentifier;
    }

    public void setLastAssignedIdentifier(String lastAssignedIdentifier) {
        this.lastAssignedIdentifier = lastAssignedIdentifier;
    }

    public boolean isExhausted() {
        return getLastAssignedIdentifier() != null && getLastAssignedIdentifier().equals(getIdentifierEnd());
    }
}
