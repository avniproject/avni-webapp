package org.openchs.domain;

import org.openchs.application.FormElement;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Entity
@Table(name = "concept")
public class Concept extends CHSEntity {
    @NotNull
    private String name;

    @NotNull
    private String dataType;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "concept", orphanRemoval = true)
    private Set<ConceptAnswer> conceptAnswers;

    private Double lowAbsolute;
    private Double highAbsolute;
    private Double lowNormal;
    private Double highNormal;
    private String unit;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public Double getLowAbsolute() {
        return lowAbsolute;
    }

    public void setLowAbsolute(Double lowAbsolute) {
        this.lowAbsolute = lowAbsolute;
    }

    public Double getHighAbsolute() {
        return highAbsolute;
    }

    public void setHighAbsolute(Double highAbsolute) {
        this.highAbsolute = highAbsolute;
    }

    public Double getLowNormal() {
        return lowNormal;
    }

    public void setLowNormal(Double lowNormal) {
        this.lowNormal = lowNormal;
    }

    public Double getHighNormal() {
        return highNormal;
    }

    public void setHighNormal(Double highNormal) {
        this.highNormal = highNormal;
    }

    public Set<ConceptAnswer> getConceptAnswers() {
        return conceptAnswers;
    }

    public void setConceptAnswers(Set<ConceptAnswer> conceptAnswers) {
        this.conceptAnswers = conceptAnswers;
    }

    public static Concept create(String name, String dataType) {
        return create(name, dataType, UUID.randomUUID().toString());
    }

    public static Concept create(String name, String dataType, String uuid) {
        Concept concept = new Concept();
        concept.name = name;
        concept.dataType = dataType;
        if (ConceptDataType.Coded.toString().equals(dataType)) {
            concept.conceptAnswers = new HashSet<>();
        }
        concept.setUuid(uuid);
        return concept;
    }

    public ConceptAnswer findConceptAnswer(String answerConceptName) {
        return this.getConceptAnswers().stream().filter(x -> x.getAnswerConcept().getName().equals(answerConceptName)).findAny().orElse(null);
    }

    public ConceptAnswer findConceptAnswerByConceptUUID(String answerConceptUUID) {
        return this.getConceptAnswers().stream().filter(x -> x.getAnswerConcept().getUuid().equals(answerConceptUUID)).findAny().orElse(null);
    }

    public void addAnswer(ConceptAnswer conceptAnswer) {
        this.getConceptAnswers().add(conceptAnswer);
        conceptAnswer.setConcept(this);
    }

    public void removeOrphanedConceptAnswers(List<String> answerConceptUUIDs) {
        List<ConceptAnswer> orphanedConceptAnswers = this.getConceptAnswers().stream().filter(conceptAnswer -> !answerConceptUUIDs.contains(conceptAnswer.getAnswerConcept().getUuid()))
                .collect(Collectors.toList());
        this.getConceptAnswers().removeAll(orphanedConceptAnswers);
    }


    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Concept findAnswerConcept(String answerConceptName) {
        ConceptAnswer conceptAnswer = this.findConceptAnswer(answerConceptName);
        return conceptAnswer == null ? null : conceptAnswer.getAnswerConcept();
    }

    @Override
    public String toString() {
        return "Concept{" +
                "name='" + name + '\'' +
                ", dataType='" + dataType + '\'' +
                '}';
    }
}