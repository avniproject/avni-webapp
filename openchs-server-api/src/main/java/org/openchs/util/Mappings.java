package org.openchs.util;

import org.openchs.application.FormType;
import org.openchs.domain.Encounter;
import org.openchs.domain.Individual;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;

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
    }

    static {
        ENTITY_TYPE_FORM_TYPE_MAP.put(Individual.class, FormType.IndividualProfile);
        ENTITY_TYPE_FORM_TYPE_MAP.put(Encounter.class, FormType.Encounter);
        ENTITY_TYPE_FORM_TYPE_MAP.put(ProgramEnrolment.class, FormType.ProgramEnrolment);
        ENTITY_TYPE_FORM_TYPE_MAP.put(ProgramEncounter.class, FormType.ProgramEncounter);
    }
}