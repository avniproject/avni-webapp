package org.openchs.application;

import java.util.Arrays;

public enum FormType {
    IndividualProfile, Encounter, ProgramEncounter, ProgramEnrolment, ProgramExit, ProgramEncounterCancellation, ChecklistItem, IndividualRelationship;

    static FormType[] linkedToEncounterType = {FormType.Encounter, FormType.ProgramEncounter, FormType.ProgramEncounterCancellation};
    static FormType[] linkedToProgram = {FormType.ProgramEncounter, FormType.ProgramExit, FormType.ProgramEnrolment, FormType.ProgramEncounterCancellation};

    public boolean isLinkedToEncounterType() {
        return Arrays.asList(linkedToEncounterType).contains(this);
    }

    public boolean isLinkedToProgram() {
        return Arrays.asList(linkedToProgram).contains(this);
    }
}
