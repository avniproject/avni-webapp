package org.openchs.application;

import java.util.Arrays;

public enum FormType {
    IndividualProfile, Encounter, ProgramEncounter, ProgramEnrolment, ProgramExit;

    static FormType[] formTypesWithEncounterTypes = {FormType.Encounter, FormType.ProgramEncounter};

    public boolean hasEncounterType() {
        return Arrays.asList(formTypesWithEncounterTypes).contains(this);
    }
}
