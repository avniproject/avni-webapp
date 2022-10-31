package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "identifier_assignment")
@JsonIgnoreProperties({"identifierSource", "assignedTo", "individual", "programEnrolment"})
@BatchSize(size = 100)
public class IdentifierAssignment extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name = "identifier_source_id")
    private IdentifierSource identifierSource;

    @NotNull
    private String identifier;

    @NotNull
    private Long assignmentOrder;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name = "individual_id")
    private Individual individual;

    @ManyToOne(fetch= FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "program_enrolment_id")
    private ProgramEnrolment programEnrolment;

    public IdentifierAssignment() {
        super();
    }

    public IdentifierAssignment(IdentifierSource identifierSource, String identifier, Long assignmentOrder, User assignedTo) {
        this();
        this.identifierSource = identifierSource;
        this.identifier = identifier;
        this.assignmentOrder = assignmentOrder;
        this.assignedTo = assignedTo;
    }

    public IdentifierSource getIdentifierSource() {
        return identifierSource;
    }

    public void setIdentifierSource(IdentifierSource identifierSource) {
        this.identifierSource = identifierSource;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public Long getAssignmentOrder() {
        return assignmentOrder;
    }

    public void setAssignmentOrder(Long assignmentOrder) {
        this.assignmentOrder = assignmentOrder;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public ProgramEnrolment getProgramEnrolment() {
        return programEnrolment;
    }

    public void setProgramEnrolment(ProgramEnrolment programEnrolment) {
        this.programEnrolment = programEnrolment;
    }
}
