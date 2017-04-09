package org.openchs.web.request.application;

import org.openchs.application.KeyValues;
import org.openchs.web.request.ReferenceDataRequest;

import java.util.List;

public class FormElementRequest extends ReferenceDataRequest {
    private boolean isMandatory;
    private KeyValues keyValues;
    private String conceptName;
    private String dataType;
    private List<String> answers;

    public boolean isMandatory() {
        return isMandatory;
    }

    public void setMandatory(boolean mandatory) {
        isMandatory = mandatory;
    }

    public KeyValues getKeyValues() {
        return keyValues == null ? new KeyValues() : keyValues;
    }

    public void setKeyValues(KeyValues keyValues) {
        this.keyValues = keyValues;
    }

    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public List<String> getAnswers() {
        return answers;
    }

    public void setAnswers(List<String> answers) {
        this.answers = answers;
    }
}