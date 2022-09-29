package org.avni.server.domain;

import java.util.ArrayList;
import java.util.List;

public class GroupPrivileges {
    private boolean hasAllPrivileges;
    private List<GroupPrivilege> privileges;

    public GroupPrivileges(boolean hasAllPrivileges, List<GroupPrivilege> privileges) {
        this.hasAllPrivileges = hasAllPrivileges;
        this.privileges = privileges;
    }

    public GroupPrivileges() {
        this.hasAllPrivileges = true;
        this.privileges = new ArrayList<>();
    }

    public boolean hasPrivilege(String privilegeName, SubjectType subjectType, Program program, EncounterType encounterType, ChecklistDetail checklistDetail) {
        return this.hasAllPrivileges || privileges.stream().anyMatch(groupPrivilege -> groupPrivilege.matches(privilegeName, subjectType, program, encounterType, checklistDetail));
    }

    public boolean hasViewPrivilege(ChecklistItem checklistItem) {
        return this.hasViewPrivilege(checklistItem.getChecklist());
    }

    public boolean hasViewPrivilege(ProgramEncounter programEncounter) {
        return this.hasPrivilege("View visit",
                programEncounter.getProgramEnrolment().getIndividual().getSubjectType(),
                programEncounter.getProgramEnrolment().getProgram(),
                null, null
        );
    }

    public boolean hasViewPrivilege(Encounter encounter) {
        return this.hasPrivilege("View visit",
                encounter.getIndividual().getSubjectType(),
                null, null, null
        );
    }

    public boolean hasViewPrivilege(Individual individual) {
        return this.hasPrivilege("View subject", individual.getSubjectType(),
                null, null, null
        );
    }
    public boolean hasViewPrivilege(ProgramEnrolment programEnrolment) {
        return this.hasPrivilege("View enrolment details",
                programEnrolment.getIndividual().getSubjectType(),
                programEnrolment.getProgram(),
                null, null
        );
    }

    public boolean hasViewPrivilege(Checklist checklist) {
        return this.hasPrivilege("View checklist",
                checklist.getProgramEnrolment().getIndividual().getSubjectType(),
                null,
                null, checklist.getChecklistDetail()
        );
    }
}
