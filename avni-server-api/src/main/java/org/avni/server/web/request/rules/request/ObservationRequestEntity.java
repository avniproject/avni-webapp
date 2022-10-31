package org.avni.server.web.request.rules.request;

public class ObservationRequestEntity {
    private String conceptUUID;
    private Object value;

    public void setConceptUUID(String conceptUUID){
        this.conceptUUID = conceptUUID;
    }
    public String getConceptUUID(){
        return this.conceptUUID;
    }
    public void setValue(Object value){
        this.value = value;
    }
    public Object getValue(){
        return this.value;
    }
}
