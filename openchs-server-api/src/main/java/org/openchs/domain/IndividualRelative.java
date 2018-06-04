package org.openchs.domain;

import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relative")
public class IndividualRelative extends OrganisationAwareEntity {
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relation_id")
    private IndividualRelation relation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "individual_id")
    private Individual individual;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relative_individual_id")
    private Individual relativeIndividual;

    @Column
    private DateTime enterDateTime;

    @Column
    private DateTime exitDateTime;

    private boolean isVoided = false;

    public IndividualRelation getRelation() {
        return relation;
    }

    public void setRelation(IndividualRelation relation) {
        this.relation = relation;
    }

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Individual getRelativeIndividual() {
        return relativeIndividual;
    }

    public void setRelativeIndividual(Individual relativeIndividual) {
        this.relativeIndividual = relativeIndividual;
    }

    public DateTime getEnterDateTime() {
        return enterDateTime;
    }

    public void setEnterDateTime(DateTime enterDateTime) {
        this.enterDateTime = enterDateTime;
    }

    public DateTime getExitDateTime() {
        return exitDateTime;
    }

    public void setExitDateTime(DateTime exitDateTime) {
        this.exitDateTime = exitDateTime;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }
}