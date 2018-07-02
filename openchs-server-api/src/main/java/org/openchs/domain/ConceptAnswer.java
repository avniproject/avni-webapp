package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "concept_answer")
public class ConceptAnswer extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "answer_concept_id")
    private Concept answerConcept;

    @NotNull
    @Column(name = "answer_order")
    private double order;

    private boolean abnormal;

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

    public double getOrder() {
        return order;
    }

    public void setOrder(double order) {
        this.order = order;
    }

    public void setOrder(Double order) {
        this.order = order;
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
