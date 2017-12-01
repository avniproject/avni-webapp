package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.openchs.application.KeyType;
import org.openchs.application.KeyValues;
import org.openchs.application.ValueType;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.validation.ValidationResult;
import org.openchs.web.request.ReferenceDataContract;
import org.springframework.util.StringUtils;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "name", "uuid", "isMandatory", "keyValues", "conceptUUID", "concept", "displayOrder" })
public class FormElementContract extends ReferenceDataContract {
    private boolean isMandatory;
    private KeyValues keyValues;
    private String conceptUUID;
    private ConceptContract concept;
    private short displayOrder;

    public FormElementContract() {
    }

    public FormElementContract(String uuid, String userUUID, String name, boolean isMandatory, KeyValues keyValues, String conceptName, ConceptContract concept) {
        super(uuid, userUUID, name);
        this.isMandatory = isMandatory;
        this.keyValues = keyValues;
        this.conceptUUID = conceptName;
        this.concept = concept;
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

        if (concept != null && concept.isCoded() && keyValuesAreInvalid())
            return ValidationResult.Failure(String.format("Doesn't specify whether the FormElement=\"%s\" is single or multi select", this.getName()));

        return ValidationResult.Success;
    }

    private boolean keyValuesAreInvalid() {
        return keyValues == null
                || keyValues.isEmpty()
                || !keyValues.containsKey(KeyType.Select)
                || !keyValues.containsOneOfTheValues(KeyType.Select, ValueType.getSelectValueTypes());
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
}