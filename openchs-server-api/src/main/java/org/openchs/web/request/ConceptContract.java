package org.openchs.web.request;

import java.util.List;

public class ConceptContract extends ReferenceDataContract {
    private String dataType;
    private List<AnswerConceptContract> answers;
    private Double lowAbsolute;
    private Double highAbsolute;
    private Double lowNormal;
    private Double highNormal;
    private String unit;

    public String getDataType() {
        return dataType == null ? null : dataType.trim();
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public List<AnswerConceptContract> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerConceptContract> answers) {
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

    @Override
    public String toString() {
        return String.format("UUID: %s, Name: %s, DataType: %s", this.getUuid(), this.getName(), this.getDataType());
    }
}