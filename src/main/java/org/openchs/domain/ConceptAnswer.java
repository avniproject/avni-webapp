package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "concept_answer")
public class ConceptAnswer extends CHSEntity{

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    private Concept concept;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_concept_id")
    private Concept answerConcept;

    @NotNull
    @Column(name = "sort_weight")
    private Double sortWeight;

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

    public Double getSortWeight() {
        return sortWeight;
    }

    public void setSortWeight(Double sortWeight) {
        this.sortWeight = sortWeight;
    }

    public int compareTo(ConceptAnswer ca) {
        if ((getSortWeight() == null) && (ca.getSortWeight() != null)) {
            return -1;
        }
        if ((getSortWeight() != null) && (ca.getSortWeight() == null)) {
            return 1;
        }
        if ((getSortWeight() == null) && (ca.getSortWeight() == null)) {
            return 0;
        }
        return (getSortWeight() < ca.getSortWeight()) ? -1 : (getSortWeight() > ca.getSortWeight()) ? 1 : 0;
    }


}
