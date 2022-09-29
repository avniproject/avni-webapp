package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.avni.server.application.KeyValues;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
import org.avni.server.domain.ConceptDataType;

import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
@JsonPropertyOrder({"name", "uuid", "dataType", "answers", "order", "lowAbsolute", "highAbsolute", "lowNormal", "highNormal", "unit", "unique", "organisationUUID"})
public class ConceptContract extends ReferenceDataContract {
    private String dataType;
    private List<ConceptContract> answers;
    private Double lowAbsolute;
    private Double highAbsolute;
    private Double lowNormal;
    private Double highNormal;
    private String unit;
    private String organisationUUID;
    private boolean abnormal;
    private Boolean active;
    private boolean unique = false;
    private Double order;
    private KeyValues keyValues;

    public static ConceptContract create(Concept concept) {
        ConceptContract conceptContract = new ConceptContract();
        conceptContract.setUuid(concept.getUuid());
        conceptContract.setName(concept.getName());
        conceptContract.setDataType(concept.getDataType());
        conceptContract.setVoided(concept.isVoided());
        conceptContract.setActive(concept.getActive());
        conceptContract.setKeyValues(concept.getKeyValues());
        conceptContract.setLowAbsolute(concept.getLowAbsolute());
        conceptContract.setLowNormal(concept.getLowNormal());
        conceptContract.setHighAbsolute(concept.getHighAbsolute());
        conceptContract.setHighNormal(concept.getHighNormal());
        List<ConceptContract> answerConceptContracts = concept.getConceptAnswers().stream()
                .map((ConceptAnswer answer) -> {
                    Concept answerConcept = answer.getAnswerConcept();
                    ConceptContract answerConceptContract = ConceptContract.create(answerConcept);
                    answerConceptContract.setOrder(answer.getOrder());
                    answerConceptContract.setAbnormal(answer.isAbnormal());
                    answerConceptContract.setUnique(answer.isUnique());
                    return answerConceptContract;
                }).collect(Collectors.toList());
        conceptContract.setAnswers(answerConceptContracts);
        return conceptContract;
    }

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    public String getDataType() {
        return dataType == null ? null : dataType.trim();
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    @JsonIgnore
    public boolean isCoded() {
        return ConceptDataType.Coded.toString().equals(this.getDataType());
    }

    public List<ConceptContract> getAnswers() {
        return answers;
    }

    public void setAnswers(List<ConceptContract> answers) {
        this.answers = answers;
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

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public boolean isAbnormal() {
        return abnormal;
    }

    public void setAbnormal(boolean abnormal) {
        this.abnormal = abnormal;
    }

    public boolean isUnique() {
        return unique;
    }

    public void setUnique(boolean unique) {
        this.unique = unique;
    }

    public String getOrganisationUUID() {
        return organisationUUID;
    }

    public void setOrganisationUUID(String organisationUUID) {
        this.organisationUUID = organisationUUID;
    }

    public Double getOrder() {
        return order;
    }

    public void setOrder(Double order) {
        this.order = order;
    }

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s, DataType: %s", this.getUuid(), this.getName(), this.getDataType());
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
