package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "concept_answer")
public class ConceptAnswer extends OrganisationAwareEntity{
    @NotNull
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

    @Override
    public String toString() {
        return "ConceptAnswer{" +
                "concept=" + concept.getName() +
                ", answerConcept=" + answerConcept.getName() +
                ", order=" + order +
                '}';
    }
}
