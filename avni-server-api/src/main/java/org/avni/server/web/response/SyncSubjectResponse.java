package org.avni.server.web.response;

import org.avni.server.domain.*;
import org.avni.server.domain.individualRelationship.IndividualRelationship;

import java.util.Set;

public class SyncSubjectResponse {
    private Individual individual;
    private Set<ProgramEnrolment> programEnrolments;
    private Set<ProgramEncounter> programEncounters;
    private Set<Encounter> encounters;
    private Set<IndividualRelationship> individualRelationships;
    private Set<Checklist> checklists;
    private Set<ChecklistItem> checklistItems;
    private Set<GroupSubject> groupSubjects;

    public Individual getIndividual() {
        return individual;
    }

    public void setIndividual(Individual individual) {
        this.individual = individual;
    }

    public Set<ProgramEnrolment> getProgramEnrolments() {
        return programEnrolments;
    }

    public void setProgramEnrolments(Set<ProgramEnrolment> programEnrolments) {
        this.programEnrolments = programEnrolments;
    }

    public Set<ProgramEncounter> getProgramEncounters() {
        return programEncounters;
    }

    public void setProgramEncounters(Set<ProgramEncounter> programEncounters) {
        this.programEncounters = programEncounters;
    }

    public Set<Encounter> getEncounters() {
        return encounters;
    }

    public void setEncounters(Set<Encounter> encounters) {
        this.encounters = encounters;
    }

    public Set<IndividualRelationship> getIndividualRelationships() {
        return individualRelationships;
    }

    public void setIndividualRelationships(Set<IndividualRelationship> individualRelationships) {
        this.individualRelationships = individualRelationships;
    }

    public Set<Checklist> getChecklists() {
        return checklists;
    }

    public void setChecklists(Set<Checklist> checklists) {
        this.checklists = checklists;
    }

    public Set<ChecklistItem> getChecklistItems() {
        return checklistItems;
    }

    public void setChecklistItems(Set<ChecklistItem> checklistItems) {
        this.checklistItems = checklistItems;
    }

    public Set<GroupSubject> getGroupSubjects() {
        return groupSubjects;
    }

    public void setGroupSubjects(Set<GroupSubject> groupSubjects) {
        this.groupSubjects = groupSubjects;
    }
}
