package org.avni.server.util;

import org.avni.server.application.FormType;
import org.avni.server.domain.*;
import org.avni.server.domain.individualRelationship.IndividualRelationship;

import java.util.HashMap;
import java.util.Map;

public class Mappings {
    public static Map<String, Class> ENTITY_TYPES = new HashMap<>();
    public static Map<Class, FormType> ENTITY_TYPE_FORM_TYPE_MAP = new HashMap<>();

    static {
        ENTITY_TYPES.put(Individual.class.getSimpleName(), Individual.class);
        ENTITY_TYPES.put(Encounter.class.getSimpleName(), Encounter.class);
        ENTITY_TYPES.put(ProgramEnrolment.class.getSimpleName(), ProgramEnrolment.class);
        ENTITY_TYPES.put(ProgramEncounter.class.getSimpleName(), ProgramEncounter.class);
        ENTITY_TYPES.put(Checklist.class.getSimpleName(), Checklist.class);
        ENTITY_TYPES.put(IndividualRelationship.class.getSimpleName(), IndividualRelationship.class);
    }

    static {
        ENTITY_TYPE_FORM_TYPE_MAP.put(Individual.class, FormType.IndividualProfile);
        ENTITY_TYPE_FORM_TYPE_MAP.put(Encounter.class, FormType.Encounter);
        ENTITY_TYPE_FORM_TYPE_MAP.put(ProgramEnrolment.class, FormType.ProgramEnrolment);
        ENTITY_TYPE_FORM_TYPE_MAP.put(ProgramEncounter.class, FormType.ProgramEncounter);
        ENTITY_TYPE_FORM_TYPE_MAP.put(Checklist.class, FormType.ChecklistItem);
        ENTITY_TYPE_FORM_TYPE_MAP.put(IndividualRelationship.class, FormType.IndividualRelationship);
    }
}
