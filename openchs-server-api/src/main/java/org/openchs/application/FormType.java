package org.openchs.application;

import java.util.Arrays;

public enum FormType {
    IndividualProfile, Encounter, ProgramEncounter, ProgramEnrolment, ProgramExit, ProgramEncounterCancellation, ChecklistItem;

    static FormType[] formTypesWithEncounterTypes = {FormType.Encounter, FormType.ProgramEncounter, FormType.ProgramEncounterCancellation};
    static FormType[] formTypesLinkedToProgram = {FormType.ProgramEncounter, FormType.ProgramExit, FormType.ProgramEnrolment};

    public boolean hasEncounterType() {
        return Arrays.asList(formTypesWithEncounterTypes).contains(this);
    }

    public boolean isLinkedToProgram() {
        return Arrays.asList(formTypesLinkedToProgram).contains(this);
    }
}
