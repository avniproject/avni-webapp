package org.avni.server.application;

import java.util.Arrays;

public enum FormType {
    BeneficiaryIdentification,
    IndividualProfile,
    SubjectEnrolmentEligibility,
    ManualProgramEnrolmentEligibility,
    ProgramEnrolment,
    ProgramExit,
    ProgramEncounter,
    ProgramEncounterCancellation,
    Encounter,
    IndividualEncounterCancellation,
    ChecklistItem,
    IndividualRelationship,
    Location,
    Task;

    static FormType[] linkedToEncounterType = {Encounter, ProgramEncounter, ProgramEncounterCancellation, IndividualEncounterCancellation};
    static FormType[] linkedToProgram = {ProgramEncounter, ProgramExit, ProgramEnrolment, ProgramEncounterCancellation};

    public boolean isLinkedToEncounterType() {
        return Arrays.asList(linkedToEncounterType).contains(this);
    }

    public boolean isLinkedToProgram() {
        return Arrays.asList(linkedToProgram).contains(this);
    }
}
