package org.openchs.web.request;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

public class ObservationRequest {
    private String conceptUUID;
    private String conceptName;
    private Object value;

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "ObservationRequest{" +
                "conceptUUID='" + conceptUUID + '\'' +
                ", conceptName='" + conceptName + '\'' +
                ", value=" + value +
                '}';
    }

    public void update(Object value) {
        HashSet<String> existingValues = new HashSet<String>((List) this.value);
        existingValues.addAll((List) value);
        this.value = Arrays.asList(existingValues.toArray());
    }
}