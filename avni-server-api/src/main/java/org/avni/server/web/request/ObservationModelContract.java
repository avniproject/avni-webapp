package org.avni.server.web.request;

public class ObservationModelContract {

    private ConceptModelContract concept;
    private Object value;

    public ConceptModelContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptModelContract concept) {
        this.concept = concept;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
