package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "concept_answer")
public class ConceptAnswer extends OrganisationAwareEntity {
    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "answer_concept_id")
    private Concept answerConcept;

    @NotNull
    @Column(name = "answer_order")
    private short order;

    private boolean abnormal;

    private boolean isVoided = false;

    @Column(name = "uniq")
    private boolean unique = false;

    public Concept getConcept() {
        return concept;
    }

    public void setConcept(Concept concept) {
        this.concept = concept;
    }

    public Concept getAnswerConcept() {
        return answerConcept;
    }

    public void setAnswerConcept(Concept answerConcept) {
        this.answerConcept = answerConcept;
    }

    public short getOrder() {
        return order;
    }

    public void setOrder(short order) {
        this.order = order;
    }

    public void setOrder(Short order) {
        this.order = order.shortValue();
    }

    @Override
    public String toString() {
        return "ConceptAnswer{" +
                "concept=" + concept.getName() +
                ", answerConcept=" + answerConcept.getName() +
                ", order=" + order +
                '}';
    }

    public boolean isAbnormal() {
        return abnormal;
    }

    public void setAbnormal(boolean abnormal) {
        this.abnormal = abnormal;
    }

    public void setAbnormal(Boolean abnormal) {
        this.abnormal = abnormal.booleanValue();
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }

    public void setVoided(Boolean voided) {
        isVoided = voided.booleanValue();
    }

    public boolean isUnique() {
        return unique;
    }

    public void setUnique(Boolean unique) {
        this.unique = unique;
    }

    public void setUnique(boolean unique) {
        this.unique = unique;
    }

    public boolean hasAnswerConcept(Concept answerConcept) {
        return getAnswerConcept().getUuid().equals(answerConcept.getUuid());
    }
}
