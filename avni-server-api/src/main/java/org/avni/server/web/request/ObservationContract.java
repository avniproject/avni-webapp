package org.avni.server.web.request;

import java.util.List;

public class ObservationContract extends ReferenceDataContract{
    private ConceptContract concept;
    private Object value;
    private List<IndividualContract> subjects;
    private AddressLevelContractWeb location;

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

    public List<IndividualContract> getSubjects() {
        return subjects;
    }

    public void setSubjects(List<IndividualContract> subjects) {
        this.subjects = subjects;
    }

    public AddressLevelContractWeb getLocation() {
        return location;
    }

    public void setLocation(AddressLevelContractWeb location) {
        this.location = location;
    }
}
