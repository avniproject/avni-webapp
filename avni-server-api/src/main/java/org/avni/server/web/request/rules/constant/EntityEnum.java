package org.avni.server.web.request.rules.constant;

public enum EntityEnum {
    PROGRAM_ENCOUNTER_ENTITY("Program Encounter"),
    ENCOUNTER_ENTITY("Encounter"),
    PROGRAM_ENROLMENT_ENTITY("Program Enrolment"),
    INDIVIDUAL_ENTITY("Individual");
    private String entityName;

    public String getEntityName() {
        return entityName;
    }

    EntityEnum(String entityName){
        this.entityName = entityName;
    }
}
