package org.openchs.web.request;

import java.util.List;

public class ObservationRequest {
    private String conceptUUID;
    private Object valuePrimitive; //all primitives
    private List<String> valueCoded; // all coded

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

    public Object getValuePrimitive() {
        return valuePrimitive;
    }

    public void setValuePrimitive(Object valuePrimitive) {
        this.valuePrimitive = valuePrimitive;
    }

    public List<String> getValueCoded() {
        return valueCoded;
    }

    public void setValueCoded(List<String> valueCoded) {
        this.valueCoded = valueCoded;
    }
}