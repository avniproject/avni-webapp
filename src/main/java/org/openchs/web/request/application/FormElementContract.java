package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.KeyValues;
import org.openchs.web.request.ReferenceDataDocument;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "name", "uuid", "isMandatory", "keyValues", "conceptName", "dataType", "displayOrder", "answers" })
public class FormElementContract extends ReferenceDataDocument {
    private boolean isMandatory;
    private KeyValues keyValues;
    private String conceptName;
    private String dataType;
    private List<String> answers;
    private short displayOrder;

    public FormElementContract() {
    }

    public FormElementContract(String uuid, String userUUID, String name, boolean isMandatory, KeyValues keyValues, String conceptName, String dataType) {
        super(uuid, userUUID, name);
        this.isMandatory = isMandatory;
        this.keyValues = keyValues;
        this.conceptName = conceptName;
        this.dataType = dataType;
    }

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

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }
}