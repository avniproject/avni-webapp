package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.lucene.analysis.core.LowerCaseFilterFactory;
import org.apache.lucene.analysis.core.WhitespaceTokenizerFactory;
import org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilterFactory;
import org.apache.lucene.analysis.ngram.EdgeNGramFilterFactory;
import org.apache.lucene.analysis.standard.StandardTokenizerFactory;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.Type;
import org.hibernate.search.annotations.Parameter;
import org.hibernate.search.annotations.*;
import org.openchs.application.KeyValues;
import org.openchs.web.request.ConceptContract;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Entity
@Indexed
@Table(name = "concept")
@AnalyzerDefs({
        @AnalyzerDef(name = "edgeNgram",
                tokenizer = @TokenizerDef(factory = WhitespaceTokenizerFactory.class),
                filters = {
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class), // Replace accented characeters by their simpler counterpart (è => e, etc.)
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class), // Lowercase all characters
                        @TokenFilterDef(
                                factory = EdgeNGramFilterFactory.class, // Generate prefix tokens
                                params = {
                                        @Parameter(name = "minGramSize", value = "1"),
                                        @Parameter(name = "maxGramSize", value = "10")
                                }
                        )
                }),
        @AnalyzerDef(name = "edgeNGram_query",
                tokenizer = @TokenizerDef(factory = StandardTokenizerFactory.class),
                filters = {
                        @TokenFilterDef(factory = ASCIIFoldingFilterFactory.class), // Replace accented characeters by their simpler counterpart (è => e, etc.)
                        @TokenFilterDef(factory = LowerCaseFilterFactory.class), // Lowercase all characters
                })
})
@BatchSize(size = 100)
@DynamicInsert
public class Concept extends OrganisationAwareEntity {
    @Field
    @Analyzer(definition = "edgeNgram")
    @NotNull
    private String name;

    @Field
    @NotNull
    private String dataType;

    @Column
    @Type(type = "keyValues")
    private KeyValues keyValues;

    private Boolean active;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "concept")
    private Set<ConceptAnswer> conceptAnswers = new HashSet<>();

    private Double lowAbsolute;
    private Double highAbsolute;
    private Double lowNormal;
    private Double highNormal;
    private String unit;
    private Integer locationGranularity;

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

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    public Integer getLocationGranularity() {
        return locationGranularity;
    }

    public void setLocationGranularity(Integer locationGranularity) {
        this.locationGranularity = locationGranularity;
    }

    public ConceptAnswer findConceptAnswerByName(String answerConceptName) {
        return this.getConceptAnswers().stream().filter(x -> x.getAnswerConcept().getName().toLowerCase().equals(answerConceptName.toLowerCase())).findAny().orElse(null);
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
        conceptContract.setName(this.getName());
        conceptContract.setUuid(this.getUuid());
        conceptContract.setDataType(this.getDataType());
        conceptContract.setLowAbsolute(this.getLowAbsolute());
        conceptContract.setHighAbsolute(this.getHighAbsolute());
        conceptContract.setLowNormal(this.getLowNormal());
        conceptContract.setHighNormal(this.getHighNormal());
        conceptContract.setUnit(this.getUnit());
        conceptContract.setVoided(this.isVoided());

        if (dataTypeMatches(ConceptDataType.Coded)) {
            conceptContract.setAnswers(new ArrayList<>());
            for (ConceptAnswer answer : this.getConceptAnswers()) {
                Concept answerConcept = answer.getAnswerConcept();

                ConceptContract answerConceptContract = new ConceptContract();
                answerConceptContract.setUuid(answerConcept.getUuid());
                answerConceptContract.setName(answerConcept.getName());
                answerConceptContract.setOrder(answer.getOrder());
                answerConceptContract.setAbnormal(answer.isAbnormal());
                answerConceptContract.setUnique(answer.isUnique());

                conceptContract.getAnswers().add(answerConceptContract);
            }
        }
        return conceptContract;
    }

    private boolean dataTypeMatches(ConceptDataType conceptDataType) {
        return ConceptDataType.matches(conceptDataType, this.getDataType());
    }

    public Stream<ConceptAnswer> getSortedAnswers() {
        return this.getConceptAnswers().stream().sorted(Comparator.comparing(ConceptAnswer::getOrder));
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = Optional.ofNullable(active).orElse(true);
    }

    public Boolean isCoded() {
        return ConceptDataType.Coded.toString().equals(this.dataType);
    }
}
