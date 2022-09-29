package org.avni.server.web.request.syncAttribute;

import org.avni.server.domain.Concept;

public class ConceptSyncAttributeContract {
    private String id;
    private String name;
    private String dataType;

    public static ConceptSyncAttributeContract fromConcept(Concept concept) {
        ConceptSyncAttributeContract conceptSyncAttributeContract = new ConceptSyncAttributeContract();
        conceptSyncAttributeContract.setName(concept.getName());
        conceptSyncAttributeContract.setId(concept.getUuid());
        conceptSyncAttributeContract.setDataType(concept.getDataType());
        return conceptSyncAttributeContract;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }
}
