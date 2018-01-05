package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.KeyValues;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.ReferenceDataContract;
import org.openchs.web.request.FormatContract;
import org.openchs.web.validation.ValidationResult;
import org.springframework.util.StringUtils;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"name", "uuid", "isMandatory", "keyValues", "conceptUUID", "concept", "displayOrder", "type"})
public class FormElementContract extends ReferenceDataContract {
    private boolean isMandatory;
    private KeyValues keyValues;
    private String conceptUUID;
    private ConceptContract concept;
    private short displayOrder;
    private String type;
    private FormatContract validFormat;

    public FormElementContract() {
    }

    public FormElementContract(String uuid, String userUUID, String name, boolean isMandatory, KeyValues keyValues, String conceptName, ConceptContract concept, String type, FormatContract validFormat) {
        super(uuid, userUUID, name);
        this.isMandatory = isMandatory;
        this.keyValues = keyValues;
        this.conceptUUID = conceptName;
        this.concept = concept;
        this.type = type;
        this.validFormat = validFormat;
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

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

    public short getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(short displayOrder) {
        this.displayOrder = displayOrder;
    }

    public ValidationResult validate() {
        if (!canIdentifyConceptUniquely()) {
            return ValidationResult.Failure("One and only one of conceptUUID or concept can be provided");
        }

        if (concept != null && concept.isCoded() && !typeSpecified())
            return ValidationResult.Failure(String.format("Doesn't specify whether the FormElement=\"%s\" is single or multi select", this.getName()));

        return ValidationResult.Success;
    }

    private boolean typeSpecified() {
        return type != null;
    }

    private boolean canIdentifyConceptUniquely() {
        return this.concept == null ^ StringUtils.isEmpty(conceptUUID);
    }

    public ConceptContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptContract concept) {
        this.concept = concept;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "{" +
                "name=" + this.getName() + '\'' +
                "isMandatory=" + isMandatory +
                ", displayOrder=" + displayOrder +
                '}';
    }

    public FormatContract getValidFormat() {
        return validFormat;
    }

    public void setValidFormat(FormatContract validFormat) {
        this.validFormat = validFormat;
    }
}