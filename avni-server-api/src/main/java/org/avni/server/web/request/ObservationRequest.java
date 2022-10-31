package org.avni.server.web.request;


import java.util.ArrayList;
import java.util.Collection;
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

    public <T> List<T> addAll(Collection<T> value) {
        HashSet<T> existingValues = new HashSet<>((Collection<T>) this.value);
        existingValues.addAll(value);
        return new ArrayList<>(existingValues);
    }

    public void update(Object value) {
        if(this.value instanceof Collection && value instanceof Collection) {
            this.value = addAll((Collection) value);
        } else {
            this.value = value;
        }
    }
}
