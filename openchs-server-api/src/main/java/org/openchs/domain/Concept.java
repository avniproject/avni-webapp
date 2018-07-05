package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.search.annotations.*;
import org.hibernate.search.annotations.Index;
import org.openchs.web.request.ConceptContract;
import org.springframework.beans.BeanUtils;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.lucene.analysis.standard.StandardTokenizerFactory;
import org.apache.lucene.analysis.core.LowerCaseFilterFactory;
import org.apache.lucene.analysis.snowball.SnowballPorterFilterFactory;
import org.hibernate.search.annotations.Parameter;

@Entity
@Indexed
@Table(name = "concept")
@AnalyzerDef(name = "customanalyzer",
  tokenizer = @TokenizerDef(factory = StandardTokenizerFactory.class),
  filters = {
    @TokenFilterDef(factory = LowerCaseFilterFactory.class),
    @TokenFilterDef(factory = SnowballPorterFilterFactory.class, params = {
      @Parameter(name = "language", value = "English")
    })
  })
public class Concept extends OrganisationAwareEntity {
    @Field
    @Analyzer(definition = "customanalyzer")
    @NotNull
    private String name;

    @Field
    @NotNull
    private String dataType;

    @OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, mappedBy = "concept")
    private Set<ConceptAnswer> conceptAnswers = new HashSet<>();

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
        if (uuid == null) {
            concept.assignUUID();
        } else {
            concept.setUuid(uuid);
        }
        return concept;
    }

    public ConceptAnswer findConceptAnswerByName(String answerConceptName) {
        return this.getConceptAnswers().stream().filter(x -> x.getAnswerConcept().getName().equals(answerConceptName)).findAny().orElse(null);
    }

    public ConceptAnswer findConceptAnswerByAnswerUuid(String conceptAnswerUuid) {
        return this.getConceptAnswers().stream().filter(x -> x.getAnswerConcept().getUuid().equals(conceptAnswerUuid)).findAny().orElse(null);
    }

    public ConceptAnswer findConceptAnswerByConceptUUID(String answerConceptUUID) {
        return this.getConceptAnswers().stream()
                .filter(x -> x.getAnswerConcept().getUuid().equals(answerConceptUUID))
                .findAny()
                .orElse(null);
    }

    public void addAnswer(ConceptAnswer conceptAnswer) {
        conceptAnswer.setConcept(this);
        this.getConceptAnswers().add(conceptAnswer);
    }

    public void addAll(List<ConceptAnswer> newConceptAnswers) {
        List<ConceptAnswer> nonRepeatingNewOnes = newConceptAnswers.stream().filter(newConceptAnswer ->
                this.getConceptAnswers().stream().noneMatch(oldConceptAnswer ->
                        oldConceptAnswer.hasAnswerConcept(newConceptAnswer.getAnswerConcept()))
        ).collect(Collectors.toList());
        this.getConceptAnswers().addAll(nonRepeatingNewOnes);
        nonRepeatingNewOnes.forEach(conceptAnswer -> conceptAnswer.setConcept(this));
    }

    public void voidOrphanedConceptAnswers(List<String> answerConceptUUIDs) {
        this.getConceptAnswers().forEach(conceptAnswer -> conceptAnswer.setVoided(!answerConceptUUIDs.contains(conceptAnswer.getAnswerConcept().getUuid())));
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Concept findAnswerConcept(String answerConceptName) {
        ConceptAnswer conceptAnswer = this.findConceptAnswerByName(answerConceptName);
        return conceptAnswer == null ? null : conceptAnswer.getAnswerConcept();
    }

    @Override
    public String toString() {
        return "Concept{" +
                "name='" + name + '\'' +
                ", dataType='" + dataType + '\'' +
                '}';
    }

    public Object getDbValue(Object value, Boolean isSingleSelect) {
        if (value == null) return null;

        if (ConceptDataType.Coded.toString().equals(this.getDataType())) {
            Concept answerConcept = this.findAnswerConcept((String) value);
            if (answerConcept == null)
                throw new NullPointerException(String.format("Answer concept |%s| not found in concept |%s|", value, this.name));
            return isSingleSelect ? answerConcept.getUuid() : Arrays.asList(answerConcept.getUuid());
        }
        return value;
    }

    @JsonIgnore
    public ConceptContract toConceptContract() {
        ConceptContract conceptContract = new ConceptContract();
        BeanUtils.copyProperties(this, conceptContract);
        if (ConceptDataType.Coded.toString().equals(this.getDataType())) {
            conceptContract.setAnswers(new ArrayList<>());
        }
        for (ConceptAnswer answer : this.getConceptAnswers()) {
            ConceptContract answerConceptContract = new ConceptContract();
            answerConceptContract.setUuid(answer.getAnswerConcept().getUuid());
            answerConceptContract.setName(answer.getAnswerConcept().getName());
            conceptContract.getAnswers().add(answerConceptContract);
        }
        return conceptContract;
    }
}
