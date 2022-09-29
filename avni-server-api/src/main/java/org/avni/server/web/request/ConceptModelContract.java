package org.avni.server.web.request;

import org.avni.server.application.KeyValues;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;

import java.util.List;
import java.util.stream.Collectors;

public class ConceptModelContract {
    private String uuid;
    private String name;
    private String datatype;
    private Double lowAbsolute;
    private Double hiAbsolute;
    private Double lowNormal;
    private String unit;
    private KeyValues keyValues;
    private Boolean voided;
    private List<ConceptAnswerModelContract> answers;

    public static ConceptModelContract fromConcept(Concept concept) {
        ConceptModelContract conceptModelContract = new ConceptModelContract();
        conceptModelContract.setUuid(concept.getUuid());
        conceptModelContract.setName(concept.getName());
        conceptModelContract.setDatatype(concept.getDataType());
        conceptModelContract.setHiAbsolute(concept.getHighAbsolute());
        conceptModelContract.setLowAbsolute(concept.getLowAbsolute());
        conceptModelContract.setLowNormal(concept.getLowNormal());
        conceptModelContract.setKeyValues(concept.getKeyValues());
        conceptModelContract.setVoided(concept.isVoided());
        conceptModelContract.setUnit(concept.getUnit());
        if (ConceptDataType.Coded.name().equals(concept.getDataType())) {
            List<ConceptAnswerModelContract> conceptAnswerModelContractList = concept.getConceptAnswers()
                    .stream()
                    .map(ConceptAnswerModelContract::fromConceptAnswer)
                    .collect(Collectors.toList());
            conceptModelContract.setAnswers(conceptAnswerModelContractList);
        }
        return conceptModelContract;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDatatype() {
        return datatype;
    }

    public void setDatatype(String datatype) {
        this.datatype = datatype;
    }

    public Double getLowAbsolute() {
        return lowAbsolute;
    }

    public void setLowAbsolute(Double lowAbsolute) {
        this.lowAbsolute = lowAbsolute;
    }

    public Double getHiAbsolute() {
        return hiAbsolute;
    }

    public void setHiAbsolute(Double hiAbsolute) {
        this.hiAbsolute = hiAbsolute;
    }

    public Double getLowNormal() {
        return lowNormal;
    }

    public void setLowNormal(Double lowNormal) {
        this.lowNormal = lowNormal;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    public Boolean getVoided() {
        return voided;
    }

    public void setVoided(Boolean voided) {
        this.voided = voided;
    }

    public List<ConceptAnswerModelContract> getAnswers() {
        return answers;
    }

    public void setAnswers(List<ConceptAnswerModelContract> answers) {
        this.answers = answers;
    }

}
