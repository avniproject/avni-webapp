package org.openchs.web.request;

public class ObservationContract extends ReferenceDataContract{
    private ConceptContract concept;
    private Object value;

    public ConceptContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptContract concept) {
        this.concept = concept;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
