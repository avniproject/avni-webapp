package org.avni.server.web.request.webapp;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.application.KeyValues;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_DEFAULT)
public class ConceptExport {
    private String name;
    private String uuid;
    private String dataType;
    private Double lowAbsolute;
    private Double highAbsolute;
    private Double lowNormal;
    private Double highNormal;
    private String unit;
    private Boolean active;
    private boolean voided;
    private List<AnswerExport> answers;

    public KeyValues getKeyValues() {
        return keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    private KeyValues keyValues;

    public ConceptExport() {
        answers = new ArrayList<>();
    }

    public boolean addAnswer(AnswerExport answerExport) {
        return this.answers.add(answerExport);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
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

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public static ConceptExport fromConcept(Concept concept) {
        ConceptExport export = new ConceptExport();
        export.setName(concept.getName());
        export.setUuid(concept.getUuid());
        export.setDataType(concept.getDataType());
        export.setLowAbsolute(concept.getLowAbsolute());
        export.setHighAbsolute(concept.getHighAbsolute());
        export.setLowNormal(concept.getLowNormal());
        export.setHighNormal(concept.getHighNormal());
        export.setUnit(concept.getUnit());
        export.setVoided(concept.isVoided());
        export.setActive(concept.getActive());
        export.setKeyValues(concept.getKeyValues());
        List<ConceptAnswer> conceptAnswersSortedByOrder = concept.getConceptAnswers()
                .stream()
                .sorted(Comparator.comparing(ConceptAnswer::getOrder))
                .collect(Collectors.toList());
        for (ConceptAnswer answer : conceptAnswersSortedByOrder) {
            Concept answerConcept = answer.getAnswerConcept();

            AnswerExport answerExport = new AnswerExport();
            answerExport.setUuid(answerConcept.getUuid());
            answerExport.setName(answerConcept.getName());
            answerExport.setOrder(answer.getOrder());
            answerExport.setAbnormal(answer.isAbnormal());
            answerExport.setUnique(answer.isUnique());
            answerExport.setVoided(answer.isVoided());

            export.addAnswer(answerExport);
        }
        return export;
    }

    public List<AnswerExport> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerExport> answers) {
        this.answers = answers;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
