package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.avni.server.application.projections.BaseProjection;
import org.avni.server.projection.ConceptProjection;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "concept_answer")
@BatchSize(size = 100)
public class ConceptAnswer extends OrganisationAwareEntity {
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "concept_id")
    @Fetch(FetchMode.JOIN)
    private Concept concept;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_concept_id")
    @Fetch(FetchMode.JOIN)
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

    public boolean editableBy(Long orgId) {
        return getOrganisationId() == null || Objects.equals(getOrganisationId(), orgId);
    }

    @Projection(name = "ConceptAnswerProjection", types = {ConceptAnswer.class})
    public interface ConceptAnswerProjection extends BaseProjection {
        double getOrder();
        boolean isAbnormal();
        boolean isUnique();
        ConceptProjection getAnswerConcept();
        Boolean getVoided();
    }
}
